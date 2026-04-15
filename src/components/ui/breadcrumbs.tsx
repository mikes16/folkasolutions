import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
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
            const isLast = index === items.length - 1;
            return (
              <li key={index} className={`flex items-center gap-2${isLast ? " hidden md:flex" : ""}`}>
                {index > 0 && (
                  <span aria-hidden="true" className="text-muted/40">/</span>
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
