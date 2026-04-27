interface TrustStripProps {
  labels: string[];
}

// Editorial hairline version — tracking-heavy Rajdhani labels separated by
// thin vertical rules. No icons, no grid, no card. Intentional opposite of
// the SaaS "feature grid" pattern.
export function TrustStrip({ labels }: TrustStripProps) {
  return (
    <section className="border-y border-border">
      <div className="container-page py-6 md:py-7">
        <ul className="flex flex-wrap items-center justify-center gap-y-3 text-center">
          {labels.map((label, i) => (
            <li
              key={i}
              className="flex items-center"
            >
              <span className="text-[11px] md:text-[12px] uppercase tracking-[2.5px] font-medium text-foreground/70 font-[family-name:var(--font-rajdhani)] px-5 md:px-8">
                {label}
              </span>
              {i < labels.length - 1 && (
                <span
                  aria-hidden="true"
                  className="h-3 w-px bg-foreground/15"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
