/**
 * Shopify CSV Translation Pipeline (via Translate & Adapt export)
 *
 * Lee CSVs exportados de Shopify Translate & Adapt, traduce con Claude
 * usando instrucciones de experto cafetero mexicano, y genera CSVs listos
 * para importar de vuelta.
 *
 * Flujo:
 *   1. En Shopify Admin → Settings → Languages → Spanish → Export CSVs
 *   2. Pon los CSVs en ./exports/
 *   3. Corre: npm run translate
 *   4. Importa los CSVs generados en ./translated/ de vuelta en Shopify
 *
 * Uso:
 *   npx tsx scripts/translate-shopify.ts                          # traduce todo
 *   npx tsx scripts/translate-shopify.ts --input ./mis-exports    # carpeta custom
 *   npx tsx scripts/translate-shopify.ts --dry-run                # ver sin generar
 *
 * Variables de entorno requeridas (.env.local):
 *   ANTHROPIC_API_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import { resolve, dirname, basename, join } from "path";
import { fileURLToPath } from "url";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from "fs";

// ── Config ───────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load .env.local
const envPath = resolve(ROOT, ".env.local");
try {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // no .env.local
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Batch size: how many rows to send to Claude per request
const BATCH_SIZE = 15;
// Smaller batch size for long HTML content (body_html, etc.)
const BATCH_SIZE_LONG = 3;

// ── CSV Parser / Writer ──────────────────────────────────

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  // Single-pass CSV parser: split into fields while handling quoted fields with
  // newlines and escaped quotes ("") correctly.
  const rows: string[][] = [];
  let fields: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        field += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(field);
      field = "";
    } else if (ch === "\n" && !inQuotes) {
      fields.push(field);
      field = "";
      if (fields.length > 1 || fields.some((f) => f.trim())) {
        rows.push(fields);
      }
      fields = [];
    } else if (ch === "\r" && !inQuotes) {
      // skip \r, \n will follow
    } else {
      field += ch;
    }
  }
  // Flush last row
  fields.push(field);
  if (fields.length > 1 || fields.some((f) => f.trim())) {
    rows.push(fields);
  }

  return { headers: rows[0] ?? [], rows: rows.slice(1) };
}

function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function toCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCSVField).join(",");
  const dataLines = rows.map((row) => row.map(escapeCSVField).join(","));
  return [headerLine, ...dataLines].join("\n") + "\n";
}

// ── Claude Translation ───────────────────────────────────

const SYSTEM_PROMPT = `Eres un traductor experto especializado en la industria del café de especialidad en México y Latinoamérica. Tu trabajo es traducir contenido de una tienda de equipo de café del inglés al español mexicano.

## Reglas inquebrantables

1. **NUNCA traduzcas estos términos** — se usan tal cual en la cultura cafetera mexicana:
   - Nombres de marcas: Profitec, Rocket, Mazzer, Fellow, Rancilio, Slayer, Breville, Faema, Niche, Eureka, Acaia, Hario, Kalita, Chemex, AeroPress, Baratza, Mahlkönig, La Marzocco, Lelit, ECM, Bezzera, Victoria Arduino
   - Nombres de modelos y productos: Aiden, Ode, Opus, Specialita, Pro 800, etc.
   - Términos técnicos del café que se usan en español sin traducir:
     espresso, latte, cappuccino, americano, flat white, pour over, drip, cold brew, french press, AeroPress, V60, Chemex, portafilter, tamper, knock box, shot, crema, pull (un shot), barista, brewing, roast, blend, single origin, body, acidity, extraction, pre-infusion, PID, flow control, grouphead, steam wand, bottomless (portafilter), WDT, RDT, channeling, puck, dosing, dialing in, grind size, burr, flat burr, conical burr, hopper, bellows, single dose, bypass, bloom, drawdown, bed, slurry, TDS, refractometer, cupping, Q-grader, SCA, specialty coffee, latte art, milk pitcher, distributor, leveler, scale, timer, gooseneck, kettle, dripper, carafe, decanter, filter, paper filter, metal filter, mesh, micro-mesh, basket, IMS, VST, naked portafilter, double shot, single shot, ristretto, lungo

2. **Usa el tono natural de un cafetero mexicano experto** — ni formal ni informal, el tono de alguien que sabe de café y habla con confianza. Tutea al cliente.

3. **Conversiones de medidas**: NO conviertas unidades. Deja las medidas como están (oz, ml, g, mm, etc.)

4. **HTML**: Conserva TODAS las etiquetas HTML exactamente como están. Solo traduce el texto visible.

5. **Longitud**: Mantén una longitud similar al original. No agregues explicaciones extra.

6. **Si el texto ya está en español correcto y natural**, devuélvelo igual. No lo "re-traduzcas".

7. **Si el campo es un handle, SKU, URL, o identificador técnico**, devuélvelo exactamente igual.

## Formato de respuesta

Responde ÚNICAMENTE con un JSON array. Cada elemento:
{ "index": <número de fila>, "translation": "<texto traducido>" }

Sin explicaciones, sin markdown, sin bloques de código. Solo el JSON puro.`;

interface TranslationRow {
  index: number;
  sourceText: string;
  fieldType: string;
}

async function translateBatch(
  client: Anthropic,
  rows: TranslationRow[],
  fileName: string,
): Promise<Map<number, string>> {
  const results = new Map<number, string>();
  if (rows.length === 0) return results;

  const payload = rows.map((r) => ({
    index: r.index,
    type: r.fieldType,
    text: r.sourceText,
  }));

  const userMessage = `Traduce el siguiente contenido de Folka Coffee (archivo: ${fileName}).

Contenido a traducir:
${JSON.stringify(payload, null, 2)}`;

  try {
    // Estimate if this batch has long content
    const totalChars = rows.reduce((sum, r) => sum + r.sourceText.length, 0);
    const maxTokens = totalChars > 3000 ? 32000 : 16000;

    // Use streaming to avoid 10-minute timeout on long content
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return results;

    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(raw) as {
      index: number;
      translation: string;
    }[];

    for (const item of parsed) {
      results.set(item.index, item.translation);
    }
  } catch (err: any) {
    console.error(`     ⚠️  Error en batch: ${err.message}`);
  }

  return results;
}

// ── Detect CSV Column Structure ──────────────────────────

interface CSVMapping {
  // Column indices
  idCol: number;
  fieldCol: number;
  typeCol: number;
  sourceCol: number;
  targetCol: number;
  // Column names
  targetHeader: string;
}

function detectColumns(headers: string[]): CSVMapping | null {
  const lower = headers.map((h) => h.toLowerCase().trim());

  // Shopify Translate & Adapt CSV format:
  // "Type", "Identifier", "Field", "Locale", "Status", "Default content", "Translated content"
  // OR variations like:
  // "Type", "ID", "Field", "Source", "Translation"

  const idCol = lower.findIndex(
    (h) => h === "identifier" || h === "id" || h === "handle",
  );
  const fieldCol = lower.findIndex(
    (h) => h === "field" || h === "field name",
  );
  const typeCol = lower.findIndex(
    (h) => h === "type" || h === "resource type",
  );

  // Source content column
  const sourceCol = lower.findIndex(
    (h) =>
      h === "default content" ||
      h === "source" ||
      h === "default value" ||
      h === "original" ||
      h === "en",
  );

  // Target content column
  const targetCol = lower.findIndex(
    (h) =>
      h === "translated content" ||
      h === "translation" ||
      h === "translated value" ||
      h === "es",
  );

  if (sourceCol === -1) {
    console.error(
      "  ❌ No encontré la columna de contenido original. Headers:",
      headers,
    );
    return null;
  }

  if (targetCol === -1) {
    console.error(
      "  ❌ No encontré la columna de traducción. Headers:",
      headers,
    );
    return null;
  }

  return {
    idCol,
    fieldCol,
    typeCol,
    sourceCol,
    targetCol,
    targetHeader: headers[targetCol],
  };
}

// ── Process a Single CSV ─────────────────────────────────

async function processCSV(
  client: Anthropic,
  inputPath: string,
  outputDir: string,
  dryRun: boolean,
): Promise<{ translated: number; skipped: number; errors: number }> {
  const fileName = basename(inputPath);
  const content = readFileSync(inputPath, "utf-8");
  const { headers, rows } = parseCSV(content);

  console.log(`\n  📄 ${fileName}: ${rows.length} rows, ${headers.length} columns`);
  console.log(`     Headers: ${headers.join(" | ")}`);

  const mapping = detectColumns(headers);
  if (!mapping) {
    return { translated: 0, skipped: 0, errors: 1 };
  }

  let translated = 0;
  let skipped = 0;
  let errors = 0;

  // Find rows that need translation
  const needsTranslation: TranslationRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const source = row[mapping.sourceCol]?.trim() ?? "";
    const existing = row[mapping.targetCol]?.trim() ?? "";
    const field = mapping.fieldCol >= 0 ? row[mapping.fieldCol] ?? "" : "";

    // Skip if no source content
    if (!source) {
      skipped++;
      continue;
    }

    // Skip if already translated (unless empty)
    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }

    // Skip handles/slugs
    if (field.toLowerCase().includes("handle") || field.toLowerCase().includes("slug")) {
      // Copy source as-is for handles
      rows[i][mapping.targetCol] = source;
      skipped++;
      continue;
    }

    needsTranslation.push({
      index: i,
      sourceText: source,
      fieldType: field,
    });
  }

  console.log(`     📊 ${needsTranslation.length} to translate, ${skipped} already done`);

  if (needsTranslation.length === 0) {
    // Still write the file if there are existing translations
    if (!dryRun) {
      const outputPath = join(outputDir, fileName);
      writeFileSync(outputPath, toCSV(headers, rows));
      console.log(`     💾 ${outputPath} (sin cambios)`);
    }
    return { translated: 0, skipped, errors: 0 };
  }

  // Split into short and long content for different batch sizes
  const longFields = new Set(["body_html", "body", "summary_html", "meta_description"]);
  const shortRows = needsTranslation.filter((r) => !longFields.has(r.fieldType));
  const longRows = needsTranslation.filter((r) => longFields.has(r.fieldType));

  // Combine into ordered batches: short rows in big batches, long rows in small batches
  const allBatches: TranslationRow[][] = [];
  for (let i = 0; i < shortRows.length; i += BATCH_SIZE) {
    allBatches.push(shortRows.slice(i, i + BATCH_SIZE));
  }
  for (let i = 0; i < longRows.length; i += BATCH_SIZE_LONG) {
    allBatches.push(longRows.slice(i, i + BATCH_SIZE_LONG));
  }

  const totalBatches = allBatches.length;
  console.log(`     📦 ${shortRows.length} short (batch ${BATCH_SIZE}), ${longRows.length} long (batch ${BATCH_SIZE_LONG}) → ${totalBatches} batches`);

  for (let b = 0; b < totalBatches; b++) {
    const batch = allBatches[b];
    const batchNum = b + 1;

    console.log(
      `     🔄 Batch ${batchNum}/${totalBatches} (${batch.length} rows)...`,
    );

    const translations = await translateBatch(client, batch, fileName);

    for (const row of batch) {
      const translation = translations.get(row.index);
      if (translation) {
        rows[row.index][mapping.targetCol] = translation;
        translated++;

        // Preview
        const preview = (s: string) =>
          s.length > 60 ? s.slice(0, 60) + "…" : s;
        if (batch.length <= 5 || b === 0) {
          console.log(`        EN: ${preview(row.sourceText)}`);
          console.log(`        ES: ${preview(translation)}`);
        }
      } else {
        errors++;
      }
    }

    // Rate limiting between batches
    if (b < totalBatches - 1) {
      await sleep(1000);
    }
  }

  // Write output CSV
  if (!dryRun) {
    const outputPath = join(outputDir, fileName);
    writeFileSync(outputPath, toCSV(headers, rows));
    console.log(`     💾 Saved: ${outputPath}`);
  }

  return { translated, skipped, errors };
}

// ── Utilities ────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const forceAll = args.includes("--force");

  // Parse --input and --output
  const inputIdx = args.indexOf("--input");
  const outputIdx = args.indexOf("--output");
  const inputDir = resolve(
    ROOT,
    inputIdx >= 0 ? args[inputIdx + 1] : "./exports",
  );
  const outputDir = resolve(
    ROOT,
    outputIdx >= 0 ? args[outputIdx + 1] : "./translated",
  );

  // Validate
  if (!ANTHROPIC_API_KEY) {
    console.error("❌ Missing ANTHROPIC_API_KEY in .env.local");
    console.error("   Agrega: ANTHROPIC_API_KEY=sk-ant-...");
    process.exit(1);
  }

  if (!existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    console.error("");
    console.error("   Pasos:");
    console.error(
      "   1. Ve a Shopify Admin → Settings → Languages → Spanish",
    );
    console.error("   2. Exporta los CSVs de cada tipo de contenido");
    console.error(`   3. Ponlos en: ${inputDir}`);
    console.error("   4. Corre este script de nuevo");
    process.exit(1);
  }

  // Find CSV files
  const csvFiles = readdirSync(inputDir).filter(
    (f) => f.endsWith(".csv") && !f.startsWith("."),
  );

  if (csvFiles.length === 0) {
    console.error(`❌ No CSV files found in ${inputDir}`);
    process.exit(1);
  }

  // Create output dir
  if (!dryRun) {
    mkdirSync(outputDir, { recursive: true });
  }

  const claude = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  console.log("☕ Folka Coffee — CSV Translation Pipeline");
  console.log(`   Input:  ${inputDir}`);
  console.log(`   Output: ${outputDir}`);
  console.log(`   Files:  ${csvFiles.length} CSVs`);
  console.log(`   Mode:   ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`   Force:  ${forceAll ? "re-translate all" : "skip existing"}`);

  let totalTranslated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of csvFiles) {
    const filePath = join(inputDir, file);
    const result = await processCSV(claude, filePath, outputDir, dryRun);

    totalTranslated += result.translated;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }

  console.log("\n━━━ Resumen ━━━");
  console.log(`  ✅ Traducidos: ${totalTranslated}`);
  console.log(`  ⏭️  Omitidos:   ${totalSkipped}`);
  console.log(`  ❌ Errores:    ${totalErrors}`);

  if (!dryRun && totalTranslated > 0) {
    console.log(`\n  📂 Archivos listos en: ${outputDir}`);
    console.log(
      "  👉 Importa cada CSV en Shopify Admin → Settings → Languages → Spanish",
    );
  }

  console.log("");
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
