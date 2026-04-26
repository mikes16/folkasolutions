import { formatCafeLocation, type StoryCafe } from "@/lib/content/stories";

export interface StoryCafeCardProps {
  cafe: StoryCafe;
  /** Localized "Visit" / "Visita" eyebrow. */
  visitLabel: string;
  /** Localized "Instagram" label (usually identical across locales). */
  igLabel: string;
  /** Localized "Website" / "Sitio web" label. */
  websiteLabel: string;
}

/**
 * Closing "visit them" card. Hairline-bordered editorial box with the café's
 * name, location, and outbound links to Instagram and the café's own site.
 *
 * Both links are optional in the data model — if neither is set, the card
 * still renders the name + location and skips the link list entirely.
 */
export function StoryCafeCard({
  cafe,
  visitLabel,
  igLabel,
  websiteLabel,
}: StoryCafeCardProps) {
  const websiteHref = cafe.website;
  const websiteLabelText = websiteHref
    ? websiteHref.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  return (
    <aside className="border border-foreground/15 p-8 md:p-10 max-w-2xl mx-auto">
      <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/65">
        {visitLabel}
      </p>
      <h2 className="text-3xl md:text-4xl font-[300] tracking-tight font-[family-name:var(--font-rajdhani)] mt-4 leading-[1.05]">
        {cafe.name}
      </h2>
      <p className="text-[11px] uppercase tracking-[3px] text-foreground/65 font-[family-name:var(--font-rajdhani)] mt-3">
        {formatCafeLocation(cafe)}
      </p>

      {(cafe.instagram || cafe.website) && (
        <div className="mt-8 flex flex-col gap-3">
          {cafe.instagram && (
            <a
              href={`https://instagram.com/${cafe.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-[12px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300 self-start"
            >
              <span className="text-foreground/65">{igLabel}</span>
              <span>@{cafe.instagram}</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
          {websiteHref && websiteLabelText && (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-[12px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300 self-start"
            >
              <span className="text-foreground/65">{websiteLabel}</span>
              <span>{websiteLabelText}</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
