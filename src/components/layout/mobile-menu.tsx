"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { locales, localeCountryMap, type Locale } from "@/i18n/config";
import { useLocale } from "next-intl";
import type { NavItem } from "@/lib/menu";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // controls animation
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const t = useTranslations();
  const tm = useTranslations("menu");
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const openMenu = useCallback(() => {
    setIsOpen(true);
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300); // wait for animation
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const switchLocale = (locale: Locale) => {
    router.replace(pathname, { locale });
    closeMenu();
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const drawer = isOpen
    ? createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[60] transition-colors duration-300 ${isVisible ? "bg-black/40" : "bg-black/0"}`}
            onClick={closeMenu}
          />

          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("common.menu")}
            className={`fixed top-0 left-0 h-full w-full max-w-sm bg-background z-[60] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "-translate-x-full"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <Image
                src="/logos/logo.webp"
                alt="Folka Coffee Solutions"
                width={267}
                height={83}
                className="h-9 w-auto"
              />
              <button
                onClick={closeMenu}
                aria-label={t("a11y.closeMenu")}
                className="p-1 hover:opacity-60 transition-opacity"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <ul className="space-y-1">
                {items.map((item, index) => (
                  <li key={item.labelKey}>
                    {item.columns ? (
                      <>
                        <button
                          onClick={() => toggleExpand(index)}
                          className="flex items-center justify-between w-full py-3 text-[13px] uppercase tracking-[2px] font-medium text-foreground/70 hover:text-foreground transition-colors"
                        >
                          {tm(item.labelKey)}
                          <Icon
                            name="chevron-down"
                            size={14}
                            className={`transition-transform duration-200 ${expandedIndex === index ? "rotate-180" : ""}`}
                          />
                        </button>

                        {expandedIndex === index && (
                          <div className="pl-4 pb-3 space-y-4">
                            {/* View All — shortcut to the category landing page */}
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className="flex items-center gap-2 py-1 text-sm font-semibold text-foreground hover:text-foreground/70 transition-colors"
                            >
                              {tm("viewAll")} {tm(item.labelKey)}
                              <Icon name="chevron-right" size={12} />
                            </Link>
                            {item.columns.map((col) => (
                              <div key={col.headingKey}>
                                {col.headingHref ? (
                                  <Link
                                    href={col.headingHref}
                                    onClick={closeMenu}
                                    className="block text-[10px] uppercase tracking-[2px] font-bold text-foreground mb-2 hover:text-foreground/70 transition-colors"
                                  >
                                    {tm(col.headingKey)}
                                  </Link>
                                ) : (
                                  <h4 className="text-[10px] uppercase tracking-[2px] font-bold text-foreground/40 mb-2">
                                    {tm(col.headingKey)}
                                  </h4>
                                )}
                                <ul className="space-y-1.5">
                                  {col.links.map((link) => (
                                    <li key={link.href}>
                                      <Link
                                        href={link.href}
                                        onClick={closeMenu}
                                        className="block py-1 text-sm text-foreground/60 hover:text-foreground transition-colors"
                                      >
                                        {tm(link.labelKey)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="block py-3 text-[13px] uppercase tracking-[2px] font-medium text-foreground/70 hover:text-foreground transition-colors"
                      >
                        {tm(item.labelKey)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <div className="border-t border-border mt-6 pt-6 space-y-1">
                <Link
                  href="/search"
                  onClick={closeMenu}
                  className="flex items-center gap-3 py-3 text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  <Icon name="search" size={18} />
                  {t("common.search")}
                </Link>
                <a
                  href="https://cafe-folka.myshopify.com/account"
                  className="flex items-center gap-3 py-3 text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  <Icon name="user" size={18} />
                  {t("common.account")}
                </a>
              </div>
            </nav>

            {/* Language selector */}
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center gap-3">
                {locales.map((locale) => {
                  const { currency } = localeCountryMap[locale];
                  return (
                    <button
                      key={locale}
                      onClick={() => switchLocale(locale)}
                      className={`text-[12px] uppercase tracking-wider px-3 py-2 rounded-full transition-colors ${
                        currentLocale === locale
                          ? "bg-foreground text-background font-bold"
                          : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      {locale} · {currency}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        onClick={openMenu}
        className="p-2 text-foreground/65 hover:text-foreground transition-opacity duration-300 lg:hidden"
        aria-label={t("common.menu")}
      >
        <Icon name="menu" size={20} />
      </button>

      {drawer}
    </>
  );
}
