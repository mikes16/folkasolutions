import type { Locale } from "@/i18n/config";
import type { JournalAuthor } from "@/lib/content/journal";
import { formatJournalDate } from "./format-date";

export interface JournalMetaProps {
  author: JournalAuthor;
  publishedAt: string;
  readingTimeMinutes: number;
  locale: Locale;
  /** Localized "Published · " prefix — passed in to keep the component pure. */
  publishedLabel: string;
  /** Localized reading-time copy, e.g. "5 min de lectura" / "5 min read". */
  readingTimeLabel: string;
}

/**
 * Sidebar meta block for the journal detail page. Author, date, reading
 * time — separated by a single hairline rule. No share buttons (deferred
 * until needed).
 */
export function JournalMeta({
  author,
  publishedAt,
  readingTimeMinutes,
  locale,
  publishedLabel,
  readingTimeLabel,
}: JournalMetaProps) {
  return (
    <aside className="flex flex-col">
      <p className="text-base font-medium leading-snug">{author.name}</p>
      <p className="text-[11px] uppercase tracking-[2.5px] text-foreground/55 font-[family-name:var(--font-rajdhani)] mt-1">
        {author.role}
        {author.affiliation ? ` · ${author.affiliation}` : ""}
      </p>
      <span aria-hidden="true" className="block h-px w-10 bg-foreground/20 my-5" />
      <p className="text-[11px] uppercase tracking-[2.5px] text-foreground/55 font-[family-name:var(--font-rajdhani)]">
        {publishedLabel}
        <span aria-hidden="true"> · </span>
        <time dateTime={publishedAt}>
          {formatJournalDate(publishedAt, locale)}
        </time>
      </p>
      <p className="text-[11px] uppercase tracking-[2.5px] text-foreground/55 font-[family-name:var(--font-rajdhani)] mt-2">
        {readingTimeMinutes} {readingTimeLabel}
      </p>
    </aside>
  );
}
