import type { Locale } from "@/i18n/config";

/**
 * Editorial date format: "25 ABR 2026" / "25 APR 2026". Uppercase short
 * month so it visually rhymes with the eyebrow and reading-time labels
 * in the card stack.
 */
export function formatJournalDate(iso: string, locale: Locale): string {
  const localeTag = locale === "es" ? "es-MX" : "en-US";
  try {
    const formatted = new Intl.DateTimeFormat(localeTag, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
    // Intl spits out "25 abr 2026" (es) or "Apr 25, 2026" (en). We
    // normalize to "DD MON YYYY" uppercase for both locales.
    if (locale === "en") {
      // "Apr 25, 2026" → "25 APR 2026"
      const match = /(\w{3})\s+(\d{1,2}),\s*(\d{4})/.exec(formatted);
      if (match) {
        const [, mon, day, year] = match;
        return `${day.padStart(2, "0")} ${mon.toUpperCase()} ${year}`;
      }
      return formatted.toUpperCase();
    }
    // es-MX gives "25 abr 2026" — strip the trailing dot some locales emit
    // and uppercase.
    return formatted.replace(/\./g, "").toUpperCase();
  } catch {
    return iso;
  }
}
