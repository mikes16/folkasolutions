import type { LegalDocument } from "@/content/legal/types";

interface LegalDocumentViewProps {
  eyebrow: string;
  title: string;
  updatedLabel: string;
  document: LegalDocument;
}

export function LegalDocumentView({
  eyebrow,
  title,
  updatedLabel,
  document,
}: LegalDocumentViewProps) {
  return (
    <div className="container-page py-12 md:py-20">
      <section className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-4">
          {eyebrow}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]">
          {title}
        </h1>
        <p className="text-[11px] uppercase tracking-[2.5px] text-muted mt-6">
          {updatedLabel}: {document.updated}
        </p>
        {document.intro && (
          <p className="text-lg text-muted mt-6 leading-relaxed">
            {document.intro}
          </p>
        )}
      </section>

      <article className="mt-16 md:mt-20 max-w-3xl">
        {document.sections.map((section, i) => (
          <section
            key={i}
            className="border-t border-border py-8 md:py-10 first:border-t-0 first:pt-0"
          >
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-5 font-[family-name:var(--font-rajdhani)]">
                {section.heading}
              </h2>
            )}
            <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-foreground/80">
              {section.paragraphs.map((paragraph, j) => (
                <p key={j}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
