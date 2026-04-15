import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { organizationSchema } from "@/lib/seo/schemas";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("intro"),
    openGraph: {
      title: t("title"),
      description: t("intro"),
      images: [{ url: `${siteConfig.siteUrl}/backs/folka_hero.webp` }],
    },
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/pages/about`,
      languages: {
        en: "/en/pages/about",
        es: "/es/pages/about",
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const pillars = [
    {
      eyebrow: t("pillar1Eyebrow"),
      title: t("pillar1Title"),
      body: t("pillar1Body"),
      image: "/backs/pilar01.webp",
    },
    {
      eyebrow: t("pillar2Eyebrow"),
      title: t("pillar2Title"),
      body: t("pillar2Body"),
      image: "/backs/pilar02.webp",
    },
  ];

  const offerings = [
    { title: t("offering1Title"), description: t("offering1Description") },
    { title: t("offering2Title"), description: t("offering2Description") },
    { title: t("offering3Title"), description: t("offering3Description") },
    { title: t("offering4Title"), description: t("offering4Description") },
    { title: t("offering5Title"), description: t("offering5Description") },
    { title: t("offering6Title"), description: t("offering6Description") },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />

      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden text-background">
        <Image
          src="/backs/folka_hero.webp"
          alt={t("heroImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

        <div className="relative z-10 h-full flex flex-col justify-between container-page py-12 md:py-16">
          <p className="text-[11px] uppercase tracking-[2.5px] font-medium opacity-80">
            {t("eyebrow")}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 lg:items-end">
            <h1 className="lg:col-span-8 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[0.95] text-balance">
              {t("title")}
            </h1>
            <p className="lg:col-span-4 text-base md:text-lg leading-relaxed opacity-85 lg:pb-4">
              {t("intro")}
            </p>
          </div>
        </div>
      </section>

      {/* Origin story */}
      <section className="container-page mt-20 md:mt-28 grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
        <div className="lg:col-span-2">
          <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-4">
            {t("storyEyebrow")}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]">
            {t("storyTitle")}
          </h2>
        </div>
        <div className="lg:col-span-3 flex flex-col gap-5 text-base md:text-lg leading-relaxed text-foreground/80">
          <p>{t("storyBody1")}</p>
          <p>{t("storyBody2")}</p>
          <p>{t("storyBody3")}</p>
        </div>
      </section>

      {/* Pillars */}
      <section className="container-page mt-20 md:mt-28">
        <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-8">
          {t("pillarsTitle")}
        </p>
        <div className="flex flex-col gap-12 md:gap-16">
          {pillars.map((pillar, i) => (
            <article
              key={pillar.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-4">
                  {pillar.eyebrow}
                </p>
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.1] mb-5">
                  {pillar.title}
                </h3>
                <p className="text-base md:text-lg leading-relaxed text-foreground/80">
                  {pillar.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section className="container-page mt-20 md:mt-28">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-4">
            {t("offeringsEyebrow")}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]">
            {t("offeringsTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {offerings.map((offering, i) => (
            <div
              key={offering.title}
              className="bg-background p-6 md:p-8 flex flex-col gap-3"
            >
              <span className="text-[11px] uppercase tracking-[2.5px] text-muted tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
                {offering.title}
              </h3>
              <p className="text-sm md:text-base text-muted leading-relaxed">
                {offering.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Origins — Chiapas & Guerrero */}
      <section className="container-page mt-20 md:mt-28 bg-foreground text-background rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
          <div className="lg:col-span-2">
            <p className="text-[11px] uppercase tracking-[2.5px] font-medium opacity-70 mb-4">
              {t("originsEyebrow")}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]">
              {t("originsTitle")}
            </h2>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t("origin1Title")}
              </h3>
              <p className="text-sm md:text-base opacity-80 leading-relaxed">
                {t("origin1Description")}
              </p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t("origin2Title")}
              </h3>
              <p className="text-sm md:text-base opacity-80 leading-relaxed">
                {t("origin2Description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-20 md:mt-28 mb-20 md:mb-28 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.1] mb-5">
          {t("ctaTitle")}
        </h2>
        <p className="text-base md:text-lg text-muted leading-relaxed mb-8">
          {t("ctaDescription")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pages/contact"
            className="inline-flex items-center justify-center bg-foreground text-background px-8 py-4 rounded-full text-sm font-medium uppercase tracking-[2px] hover:opacity-90 transition-opacity"
          >
            {t("ctaContact")}
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center border border-border px-8 py-4 rounded-full text-sm font-medium uppercase tracking-[2px] hover:bg-foreground/5 transition-colors"
          >
            {t("ctaShop")}
          </Link>
        </div>
      </section>
    </div>
  );
}
