import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig, whatsappLink } from "@/lib/site-config";

export async function Footer() {
  const t = await getTranslations("footer");

  const linkColumns = [
    {
      title: t("shop"),
      links: [
        { label: t("espressoMachines"), href: "/collections/espresso-machines" },
        { label: t("grinders"), href: "/collections/domestic-grinders" },
        { label: t("brewingEquipment"), href: "/collections/brewing" },
        { label: t("coffeeBarAccessories"), href: "/collections/coffee-bar-accessories" },
      ],
    },
    {
      title: t("companyAndSupport"),
      links: [
        { label: t("about"), href: "/pages/about" },
        { label: t("contact"), href: "/pages/contact" },
        { label: t("blog"), href: "/blogs/coffee-grounds" },
        { label: t("shippingReturns"), href: "/pages/shipping" },
        { label: t("warrantyService"), href: "/pages/warranty" },
        { label: t("faq"), href: "/pages/faq" },
      ],
    },
    {
      title: t("legal"),
      links: [
        { label: t("termsOfService"), href: "/pages/terms-of-service" },
        { label: t("refundPolicy"), href: "/pages/refund-policy" },
      ],
    },
  ];

  return (
    <footer className="bg-footer-bg text-primary-foreground mt-auto border-t border-primary-foreground/15">
      <div className="container-page py-20 md:py-24">
        {/* Mission */}
        <div className="max-w-4xl">
          <p className="text-[11px] uppercase tracking-[3px] font-medium text-primary-foreground/40 mb-6 font-[family-name:var(--font-rajdhani)]">
            {t("missionEyebrow")}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] font-[family-name:var(--font-rajdhani)]">
            {t("missionHeadline")}
          </h2>
        </div>

        {/* Hairline */}
        <div className="h-px bg-primary-foreground/10 mt-16 md:mt-20" />

        {/* Roots + contact (left) · Link columns (right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10 mt-12 md:mt-16">
          {/* Roots + contact */}
          <div className="md:col-span-4 flex flex-col gap-10">
            <div>
              <p className="text-[11px] uppercase tracking-[3px] font-medium text-primary-foreground/40 mb-3 font-[family-name:var(--font-rajdhani)]">
                {t("rootsEyebrow")}
              </p>
              <p className="text-base text-primary-foreground/80 leading-relaxed">
                {t("rootsLocations")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[3px] font-medium text-primary-foreground/40 mb-3 font-[family-name:var(--font-rajdhani)]">
                {t("contactEyebrow")}
              </p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href={`mailto:${siteConfig.email.contact}`}
                    className="text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {siteConfig.email.contact}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappLink(siteConfig.whatsapp.general, "Hola, tengo una pregunta.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {t("whatsappLabel")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {linkColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] uppercase tracking-[3px] font-medium text-primary-foreground/40 mb-5 font-[family-name:var(--font-rajdhani)]">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Hairline */}
        <div className="h-px bg-primary-foreground/10 mt-16 md:mt-20" />

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2">
            <p className="text-xs text-primary-foreground/50">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-primary-foreground/40 hidden md:block">
              {t("paymentsNote")}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
