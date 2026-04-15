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
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/pages/contact`,
      languages: {
        en: "/en/pages/contact",
        es: "/es/pages/contact",
      },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const whatsappHref = whatsappLink(
    siteConfig.whatsapp.general,
    "Hola, tengo una pregunta."
  );

  const serviceWhatsappHref = whatsappLink(
    siteConfig.whatsapp.service,
    "Hola, necesito servicio técnico para mi equipo."
  );

  const channels = [
    {
      icon: "chat-bubble" as const,
      title: t("whatsappTitle"),
      description: t("whatsappDescription"),
      cta: t("whatsappCta"),
      href: whatsappHref,
      external: true,
    },
    {
      icon: "globe" as const,
      title: t("emailTitle"),
      description: t("emailDescription"),
      cta: t("emailCta"),
      href: `mailto:${siteConfig.email.contact}`,
      external: false,
    },
    {
      icon: "shield-check" as const,
      title: t("commercialTitle"),
      description: t("commercialDescription"),
      cta: t("commercialCta"),
      href: `mailto:${siteConfig.email.commercial}?subject=${encodeURIComponent(
        "Proyecto Comercial"
      )}`,
      external: false,
    },
    {
      icon: "truck" as const,
      title: t("serviceTitle"),
      description: t("serviceDescription"),
      cta: t("serviceCta"),
      href: serviceWhatsappHref,
      external: true,
    },
  ];

  return (
    <div className="container-page py-12 md:py-20">
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-4">
          {t("eyebrow")}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
          {t("title")}
        </h1>
        <p className="text-lg text-muted mt-6 leading-relaxed">{t("intro")}</p>
      </section>

      {/* Channels */}
      <section className="mt-16 md:mt-24">
        <h2 className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-6">
          {t("channelsTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {channels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              {...(channel.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 md:p-8 hover:border-foreground transition-colors"
            >
              <Icon
                name={channel.icon}
                size={28}
                className="text-foreground/70"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-lg font-bold tracking-tight mb-2">
                  {channel.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {channel.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[2px] font-medium mt-auto pt-2 group-hover:gap-3 transition-all">
                {channel.cta}
                <Icon name="arrow-right" size={14} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Locations + hours */}
      <section className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t("locationsTitle")}
          </h2>
          <p className="text-muted max-w-xl">{t("locationsSubtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="rounded-2xl bg-white border border-border p-6">
              <p className="text-[11px] uppercase tracking-[2.5px] text-muted mb-2">
                MX
              </p>
              <h3 className="text-xl font-bold tracking-tight mb-2">
                {t("monterreyTitle")}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t("monterreyDescription")}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-border p-6">
              <p className="text-[11px] uppercase tracking-[2.5px] text-muted mb-2">
                US
              </p>
              <h3 className="text-xl font-bold tracking-tight mb-2">
                {t("sanAntonioTitle")}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t("sanAntonioDescription")}
              </p>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl bg-foreground text-background p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h3 className="text-[11px] uppercase tracking-[2.5px] font-medium mb-4 opacity-70">
              {t("hoursTitle")}
            </h3>
            <p className="text-base leading-relaxed">{t("hoursWeekdays")}</p>
            <p className="text-base leading-relaxed opacity-80">
              {t("hoursSaturday")}
            </p>
          </div>
          <div className="border-t border-background/20 pt-6">
            <h3 className="text-[11px] uppercase tracking-[2.5px] font-medium mb-3 opacity-70">
              {t("socialTitle")}
            </h3>
            <p className="text-sm opacity-80 mb-4">{t("socialDescription")}</p>
            <div className="flex flex-col gap-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:opacity-70 transition-opacity"
              >
                Instagram ↗
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:opacity-70 transition-opacity"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
