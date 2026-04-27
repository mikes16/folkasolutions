import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { formatJournalDate } from "./format-date";

export interface JournalCardProps {
  slug: string;
  eyebrow: string;
  title: string;
  description?: string;
  publishedAt: string;
  readingTimeMinutes: number;
  coverImage: { url: string; alt: string };
  locale: Locale;
  /** Localized "min read" suffix — short form, e.g. "MIN" / "MIN DE LECTURA". */
  minReadLabel: string;
  /** Aspect of the cover image. Defaults to 4/3. */
  aspect?: "4/3" | "16/9";
}

/**
 * Editorial index card. Hairlines and tracking instead of rounded
 * containers and shadows. The cover scales subtly on hover, the title
 * shifts to a softened tone — no chrome motion, only typographic motion.
 */
export function JournalCard({
  slug,
  eyebrow,
  title,
  description,
  publishedAt,
  readingTimeMinutes,
  coverImage,
  locale,
  minReadLabel,
  aspect = "4/3",
}: JournalCardProps) {
  const aspectClass = aspect === "16/9" ? "aspect-[16/9]" : "aspect-[4/3]";
  return (
    <Link
      href={`/journal/${slug}`}
      className="group flex flex-col"
    >
      <div className={`relative ${aspectClass} overflow-hidden bg-card/60`}>
        <Image
          src={coverImage.url}
          alt={coverImage.alt}
          fill
          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <p className="text-[10px] uppercase tracking-[3px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/55 mt-5">
        {eyebrow}
      </p>
      <h3 className="text-2xl md:text-3xl font-medium tracking-tight font-[family-name:var(--font-rajdhani)] mt-3 leading-[1.1] group-hover:text-foreground/70 transition-colors">
        {title}
      </h3>
      {description && (
        <p className="text-[15px] text-foreground/60 leading-relaxed mt-3 max-w-md">
          {description}
        </p>
      )}
      <p className="text-[11px] uppercase tracking-[2.5px] text-foreground/50 mt-3 font-[family-name:var(--font-rajdhani)]">
        {formatJournalDate(publishedAt, locale)}
        <span aria-hidden="true"> · </span>
        {readingTimeMinutes} {minReadLabel}
      </p>
    </Link>
  );
}
