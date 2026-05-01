"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";
import { Icon } from "@/components/ui/icon";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeCountryMap, type Locale } from "@/i18n/config";

export function CartButton() {
  const { cart, openCart } = useCart();
  const t = useTranslations("common");
  const totalQuantity = cart?.totalQuantity ?? 0;

  return (
    <button
      onClick={openCart}
      aria-label={t("cart")}
      className="p-2 text-foreground/65 hover:text-foreground transition-opacity duration-300 relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground rounded-sm"
    >
      <Icon name="cart" size={18} />
      <span className="sr-only">{t("cart")}</span>
      {totalQuantity > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-foreground text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {totalQuantity}
        </span>
      )}
    </button>
  );
}

const localeLabels: Record<Locale, { lang: string; market: string }> = {
  en: { lang: "English", market: "USA · USD" },
  es: { lang: "Español", market: "México · MXN" },
};

export function LocaleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (locale: Locale) => {
    router.replace(pathname, { locale });
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Language: ${localeLabels[currentLocale].lang}, Currency: ${localeCountryMap[currentLocale].currency}`}
        className="p-2 text-foreground/65 hover:text-foreground transition-opacity duration-300 flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground rounded-sm"
      >
        <Icon name="globe" size={18} />
        <span className="text-[11px] uppercase font-medium tracking-wider hidden sm:inline">
          {currentLocale} · {localeCountryMap[currentLocale].currency}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px] z-50">
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            const { lang, market } = localeLabels[locale];
            return (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                aria-current={isActive ? "true" : undefined}
                className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground ${
                  isActive
                    ? "bg-foreground/5 font-medium"
                    : "hover:bg-foreground/5"
                }`}
              >
                <div>
                  <div className="text-sm text-foreground">{lang}</div>
                  <div className="text-[11px] text-foreground/50">{market}</div>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
