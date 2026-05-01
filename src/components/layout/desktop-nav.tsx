"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { NavItem } from "@/lib/menu";

// `/` matches only the home route; every other href matches its prefix so a
// product detail under `/collections/maquinaria/...` still highlights its
// parent top-level item.
function isItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const t = useTranslations("menu");
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const open = useCallback((index: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenIndex(index);
  }, []);

  const close = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenIndex(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const closeNow = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenIndex(null);
  }, []);

  // Esc closes the open mega panel and returns focus to the parent item.
  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const idx = openIndex;
        closeNow();
        const trigger = navRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-trigger]")[idx];
        trigger?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex, closeNow]);

  // Click outside the nav OR the panel closes the panel.
  useEffect(() => {
    if (openIndex === null) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inNav = navRef.current?.contains(target);
      const panel = document.getElementById("mega-panel");
      const inPanel = panel?.contains(target);
      if (!inNav && !inPanel) closeNow();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openIndex, closeNow]);

  const openItem = openIndex !== null ? items[openIndex] : null;
  const hasMega = openItem?.columns && openItem.columns.length > 0;

  return (
    <>
      <nav
        ref={navRef}
        className="hidden lg:flex items-center gap-8"
        onMouseLeave={close}
        aria-label={t("primaryNav")}
      >
        {items.map((item, index) => {
          const active = isItemActive(pathname, item.href);
          const isOpen = openIndex === index;
          return (
            <div
              key={item.labelKey}
              onMouseEnter={() => (item.columns ? open(index) : close())}
            >
              <Link
                href={item.href}
                data-nav-trigger
                aria-current={active ? "page" : undefined}
                aria-haspopup={item.columns ? "true" : undefined}
                aria-expanded={item.columns ? isOpen : undefined}
                aria-controls={item.columns && isOpen ? "mega-panel" : undefined}
                onFocus={() => (item.columns ? open(index) : undefined)}
                className={`relative text-[12px] uppercase tracking-[2.5px] font-semibold transition-opacity duration-300 flex items-center gap-1.5 font-[family-name:var(--font-rajdhani)] py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground rounded-sm ${
                  isOpen || active
                    ? "text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                } ${active ? "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-foreground" : ""}`}
              >
                {t(item.labelKey)}
                {item.columns && <Icon name="chevron-down" size={12} />}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Full-width mega panel — positioned at bottom edge of header via top-full.
          Only renders when the hovered item has mega columns. */}
      {hasMega && openItem && (
        <div
          id="mega-panel"
          role="region"
          aria-label={t(openItem.labelKey)}
          className="hidden lg:block absolute left-0 right-0 top-full z-40 animate-in fade-in duration-150"
          onMouseEnter={cancelClose}
          onMouseLeave={close}
        >
          <div className="bg-background border-b border-border shadow-xl">
            <div className="container-page pt-10 pb-6">
              <div className="flex gap-12">
                {openItem.columns!.map((col) => (
                  <div key={col.headingKey} className="min-w-[160px]">
                    {col.headingHref ? (
                      <Link
                        href={col.headingHref}
                        onClick={closeNow}
                        className="block text-[12px] uppercase tracking-[2px] font-bold text-foreground hover:text-foreground/70 transition-colors mb-5 font-[family-name:var(--font-rajdhani)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground rounded-sm"
                      >
                        {t(col.headingKey)}
                      </Link>
                    ) : (
                      <h3 className="text-[12px] uppercase tracking-[2px] font-bold text-foreground mb-5 font-[family-name:var(--font-rajdhani)]">
                        {t(col.headingKey)}
                      </h3>
                    )}
                    <ul className="space-y-3">
                      {col.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={closeNow}
                            className="text-sm text-muted hover:text-foreground transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground rounded-sm"
                          >
                            {t(link.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Promo card — pushed to the far right of the mega panel.
                    Background uses the brand's Midnight Blue token so the card
                    still reads on-brand if the image asset is missing. */}
                {openItem.promoCard && (
                  <Link
                    href={openItem.promoCard.href}
                    onClick={closeNow}
                    className="group relative block w-[280px] h-[240px] rounded-xl overflow-hidden shrink-0 ml-auto bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    <NextImage
                      src={openItem.promoCard.imageUrl}
                      alt={t(openItem.promoCard.labelKey)}
                      fill
                      sizes="280px"
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="text-[10px] uppercase tracking-[2px] font-medium text-white/70 font-[family-name:var(--font-rajdhani)]">
                        {t(openItem.promoCard.sublabelKey)}
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5 font-[family-name:var(--font-rajdhani)]">
                        {t(openItem.promoCard.labelKey)}
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Tail-link — escape hatch from any category panel into the
                  full catalog with filters. Editorial pattern (Smeg, La
                  Marzocco) keeps the top bar quiet while still letting users
                  "browse everything" from any open panel. */}
              <div className="mt-8 pt-5 border-t border-border/60">
                <Link
                  href="/shop"
                  onClick={closeNow}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[2.5px] font-semibold text-foreground/70 hover:text-foreground transition-colors font-[family-name:var(--font-rajdhani)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground rounded-sm"
                >
                  {t("viewCatalog")}
                  <Icon name="chevron-right" size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
