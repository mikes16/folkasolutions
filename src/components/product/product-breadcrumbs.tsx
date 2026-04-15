"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCollectionContext, getPreviousPath } from "@/components/navigation-tracker";
import { siteConfig } from "@/lib/site-config";

interface ProductBreadcrumbsProps {
  homeLabel: string;
  productTitle: string;
  defaultCategory: { labelKey: string; handle: string } | null;
}

interface MiddleItem {
  label: string;
  href: string;
}

const COLLECTION_PATH_RE = /^\/(?:en|es)\/collections\/([^/?]+)\/?$/;
const HOME_PATH_RE = /^\/(?:en|es)\/?$/;

export function ProductBreadcrumbs({
  homeLabel,
  productTitle,
  defaultCategory,
}: ProductBreadcrumbsProps) {
  const t = useTranslations();

  const initialMiddle: MiddleItem | null = defaultCategory
    ? {
        label: t(defaultCategory.labelKey as Parameters<typeof t>[0]),
        href: `/collections/${defaultCategory.handle}`,
      }
    : null;

  const [middle, setMiddle] = useState<MiddleItem | null>(initialMiddle);

  useEffect(() => {
    const prev = getPreviousPath();
    if (!prev) return;

    if (HOME_PATH_RE.test(prev)) {
      setMiddle(null);
      return;
    }

    const match = prev.match(COLLECTION_PATH_RE);
    if (match) {
      const ctx = getCollectionContext();
      if (ctx && ctx.path === prev) {
        setMiddle({
          label: ctx.title,
          href: `/collections/${match[1]}`,
        });
      }
    }
  }, [t]);

  const items: { label: string; href?: string; isCurrent?: boolean }[] = [
    { label: homeLabel, href: "/" },
    ...(middle ? [{ label: middle.label, href: middle.href }] : []),
    { label: productTitle, isCurrent: true },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${siteConfig.siteUrl}${item.href}` }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
        <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[2px]">
          {items.map((item, index) => {
            const isLast = item.isCurrent;
            return (
              <li
                key={index}
                className={`flex items-center gap-2${isLast ? " hidden md:flex" : ""}`}
              >
                {index > 0 && (
                  <span aria-hidden="true" className="text-muted/40">
                    /
                  </span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-muted hover:text-foreground transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-foreground font-medium"
                    {...(isLast && { "aria-current": "page" as const })}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
