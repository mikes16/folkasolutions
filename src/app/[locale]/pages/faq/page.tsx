import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { faqContent } from "@/content/faq";
import type { Locale } from "@/i18n/config";
import { siteConfig, whatsappLink } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/pages/faq`,
      languages: {
        en: "/en/pages/faq",
        es: "/es/pages/faq",
      },
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

  const categories = faqContent[locale as Locale] ?? faqContent.es;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((category) =>
      category.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer.join(" "),
        },
      }))
    ),
  };

  const whatsappHref = whatsappLink(
    siteConfig.whatsapp.general,
    locale === "es"
      ? "Hola, tengo una pregunta que no encontré en el FAQ."
      : "Hi, I have a question I couldn't find in the FAQ."
  );

  return (
    <div className="container-page py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-4">
          {t("eyebrow")}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]">
          {t("title")}
        </h1>
        <p className="text-lg text-muted mt-6 leading-relaxed">{t("intro")}</p>
      </section>

      {/* Categories */}
      <div className="mt-16 md:mt-24 flex flex-col gap-16 md:gap-24">
        {categories.map((category) => (
          <section
            key={category.title}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12"
          >
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] sticky top-24">
                {category.title}
              </h2>
            </div>
            <ul className="lg:col-span-3 flex flex-col divide-y divide-border">
              {category.items.map((item) => (
                <li
                  key={item.question}
                  className="py-6 md:py-8 first:pt-0 last:pb-0"
                >
                  <details className="group">
                    <summary className="flex items-start gap-4 cursor-pointer list-none">
                      <span className="flex-1 text-base md:text-lg font-medium leading-snug">
                        {item.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 mt-1 text-muted text-xl leading-none transition-transform duration-200 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed text-foreground/75 pr-10">
                      {item.answer.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-20 md:mt-28 bg-foreground text-background rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[2.5px] font-medium opacity-70 mb-4">
            {t("ctaEyebrow")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
            {t("ctaTitle")}
          </h2>
          <p className="text-base opacity-80 mt-4 leading-relaxed">
            {t("ctaDescription")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-background text-foreground px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[2px] hover:opacity-90 transition-opacity"
          >
            {t("ctaWhatsapp")}
          </a>
          <Link
            href="/pages/contact"
            className="inline-flex items-center justify-center border border-background/30 px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[2px] hover:bg-background/10 transition-colors"
          >
            {t("ctaContact")}
          </Link>
        </div>
      </section>
    </div>
  );
}
