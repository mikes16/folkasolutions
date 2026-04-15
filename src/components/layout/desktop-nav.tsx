"use client";

import { useState, useRef, useCallback } from "react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { NavItem } from "@/lib/menu";

export function DesktopNav({ items }: { items: NavItem[] }) {
  const t = useTranslations("menu");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const openItem = openIndex !== null ? items[openIndex] : null;
  const hasMega = openItem?.columns && openItem.columns.length > 0;

  return (
    <>
      <nav className="hidden lg:flex items-center gap-8" onMouseLeave={close}>
        {items.map((item, index) => (
          <div
            key={item.labelKey}
            onMouseEnter={() => (item.columns ? open(index) : close())}
          >
            <Link
              href={item.href}
              className={`text-[12px] uppercase tracking-[2.5px] font-semibold transition-opacity duration-300 flex items-center gap-1.5 font-[family-name:var(--font-rajdhani)] ${
                openIndex === index
                  ? "text-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {t(item.labelKey)}
              {item.columns && <Icon name="chevron-down" size={12} />}
            </Link>
          </div>
        ))}
      </nav>

      {/* Full-width mega panel — positioned at bottom edge of header via top-full.
          Only renders when the hovered item has mega columns. */}
      {hasMega && openItem && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full z-40 animate-in fade-in duration-150"
          onMouseEnter={cancelClose}
          onMouseLeave={close}
        >
          <div className="bg-background border-b border-border shadow-xl">
            <div className="container-page py-10">
              <div className="flex gap-12">
                {openItem.columns!.map((col) => (
                  <div key={col.headingKey} className="min-w-[160px]">
                    {col.headingHref ? (
                      <Link
                        href={col.headingHref}
                        onClick={closeNow}
                        className="block text-[12px] uppercase tracking-[2px] font-bold text-foreground hover:text-foreground/70 transition-colors mb-5 font-[family-name:var(--font-rajdhani)]"
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
                            className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                          >
                            {t(link.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Promo card — pushed to the far right of the mega panel */}
                {openItem.promoCard && (
                  <Link
                    href={openItem.promoCard.href}
                    onClick={closeNow}
                    className="group relative block w-[280px] h-[240px] rounded-xl overflow-hidden shrink-0 ml-auto"
                    style={{ backgroundColor: "#7B97AE" }}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
