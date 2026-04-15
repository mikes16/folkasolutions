import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/ui/icon";
import { siteConfig, whatsappLink } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "warranty" });
  return {
    title: t("eyebrow"),
    description: t("intro"),
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/pages/warranty`,
      languages: {
        en: "/en/pages/warranty",
        es: "/es/pages/warranty",
      },
    },
  };
}

export default async function WarrantyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("warranty");

  const serviceHref = whatsappLink(
    siteConfig.whatsapp.service,
    "Hola, necesito servicio técnico para mi equipo."
  );

  const services = [
    { title: t("service1Title"), description: t("service1Description") },
    { title: t("service2Title"), description: t("service2Description") },
    { title: t("service3Title"), description: t("service3Description") },
    { title: t("service4Title"), description: t("service4Description") },
    { title: t("service5Title"), description: t("service5Description") },
    { title: t("service6Title"), description: t("service6Description") },
  ];

  return (
    <div className="container-page py-12 md:py-20">
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

      {/* Warranty card */}
      <section className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
        <div className="lg:col-span-2">
          <Icon
            name="shield-check"
            size={36}
            className="text-foreground/70 mb-6"
            aria-hidden="true"
          />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t("warrantyTitle")}
          </h2>
          <p className="text-muted leading-relaxed">{t("warrantyBody")}</p>
        </div>
        <ul className="lg:col-span-3 flex flex-col divide-y divide-border">
          {[
            t("warrantyBullet1"),
            t("warrantyBullet2"),
            t("warrantyBullet3"),
          ].map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
            >
              <span className="text-[11px] uppercase tracking-[2.5px] text-muted mt-1 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-base md:text-lg leading-relaxed flex-1">
                {bullet}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* CWT intro */}
      <section className="mt-16 md:mt-24 bg-foreground text-background rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16">
        <p className="text-[11px] uppercase tracking-[2.5px] font-medium opacity-70 mb-4">
          {t("cwtEyebrow")}
        </p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] max-w-3xl leading-[1.1]">
          {t("cwtTitle")}
        </h2>
        <p className="text-base md:text-lg opacity-80 mt-6 leading-relaxed max-w-2xl">
          {t("cwtBody")}
        </p>
      </section>

      {/* Services grid */}
      <section className="mt-16 md:mt-24">
        <h2 className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-8">
          {t("servicesTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-background p-6 md:p-8 flex flex-col gap-2"
            >
              <h3 className="text-lg font-bold tracking-tight">
                {service.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 md:mt-24 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {t("ctaTitle")}
        </h2>
        <p className="text-muted leading-relaxed mb-8">{t("ctaDescription")}</p>
        <a
          href={serviceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-full text-sm font-medium uppercase tracking-[2px] hover:opacity-90 transition-opacity"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-[#25D366] shrink-0"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t("ctaButton")}
        </a>
      </section>
    </div>
  );
}
