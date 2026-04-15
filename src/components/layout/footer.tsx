import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";

export async function Footer() {
  const t = await getTranslations("footer");

  const footerSections = [
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
      title: t("company"),
      links: [
        { label: t("about"), href: "/pages/about" },
        { label: t("contact"), href: "/pages/contact" },
        { label: t("blog"), href: "/blogs/coffee-grounds" },
        { label: t("faq"), href: "/pages/faq" },
      ],
    },
    {
      title: t("support"),
      links: [
        { label: t("shippingReturns"), href: "/pages/shipping" },
        { label: t("warrantyService"), href: "/pages/warranty" },
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
    <footer className="bg-white mt-auto">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logos/Isotipo.webp"
              alt="Folka Coffee Solutions"
              width={382}
              height={382}
              className="h-20 w-20 mb-4"
            />
            <p className="text-sm text-muted leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] uppercase tracking-[2.5px] font-medium mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Instagram
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
