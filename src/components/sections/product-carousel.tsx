import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "@/components/product/product-card";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface ProductCarouselProps {
  eyebrow: string;
  title: string;
  description: string;
  viewAllText: string;
  viewAllHref: string;
  products: Product[];
  /**
   * Body layout. The masthead is identical across both — variance lives in
   * the product arrangement only.
   *  - "scroll" (default): horizontal scroll-snap at every breakpoint, best
   *    for 8-12+ curated items (Home Bar, Barista Picks).
   *  - "grid": 4-col grid on desktop, scroll-snap on mobile. Best for a
   *    4-item taster moment above the fold (New Arrivals).
   */
  layout?: "scroll" | "grid";
  /**
   * When true (and layout is "scroll"), the LAST product in the rail receives
   * an editorial "View all" overlay anchored to its photography. Click target
   * routes to `viewAllHref`. Use when the underlying collection has more
   * items than were fetched (Shopify `pageInfo.hasNextPage`).
   */
  viewAllOverlay?: boolean;
}

/**
 * Shared product carousel — one consistent editorial masthead for every
 * curated product section on the site. The variance between these sections
 * lives in copy, curation, and body `layout`, not in chrome. Masthead is an
 * asymmetric 12-col grid: left carries the eyebrow and oversized Rajdhani-300
 * headline, right holds the short description and arrow-link to the full
 * collection.
 */
export function ProductCarousel({
  eyebrow,
  title,
  description,
  viewAllText,
  viewAllHref,
  products,
  layout = "scroll",
  viewAllOverlay = false,
}: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28 lg:py-32">
      <div className="container-page">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 mb-14 md:mb-20">
          <div className="md:col-span-8">
            <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/50 mb-6 md:mb-8">
              {eyebrow}
            </p>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.02] max-w-2xl"
              style={{ fontWeight: 300 }}
            >
              {title}
            </h2>
          </div>
          <div className="md:col-span-4 md:self-end flex flex-col gap-6">
            <p className="text-[15px] text-foreground/60 leading-relaxed max-w-sm">
              {description}
            </p>
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-3 self-start text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300 cursor-pointer"
            >
              {viewAllText}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>

        {layout === "grid" ? (
          <div className="-mx-5 md:-mx-10 lg:mx-0">
            <div className="flex lg:grid lg:grid-cols-4 gap-5 md:gap-7 lg:gap-9 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scroll-pl-5 md:scroll-pl-10 lg:scroll-pl-0 px-5 md:px-10 lg:px-0 pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[calc((100%-1.25rem)/2.2)] md:w-[calc((100%-2.1rem)/3.3)] lg:w-auto lg:flex-shrink snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="-mx-5 md:-mx-10 lg:-mx-12">
            <div className="flex gap-5 md:gap-7 lg:gap-9 overflow-x-auto snap-x snap-mandatory scroll-pl-5 md:scroll-pl-10 lg:scroll-pl-12 px-5 md:px-10 lg:px-12 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {products.map((product, index) => {
                const isOverlay = viewAllOverlay && index === products.length - 1;
                return (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[calc((100%-1.25rem)/2.2)] md:w-[calc((100%-2.1rem)/3.3)] lg:w-[calc((100%-2.7rem)/4.3)] snap-start"
                  >
                    <div className="relative">
                      <ProductCard product={product} />
                      {isOverlay && (
                        <Link
                          href={viewAllHref}
                          aria-label={viewAllText}
                          className="absolute inset-0 z-10 group flex flex-col items-center justify-center text-center px-6 bg-gradient-to-t from-primary via-primary/90 to-primary/30 hover:via-primary/95 transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-foreground"
                        >
                          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-primary-foreground/40 mb-7 transition-all duration-500 group-hover:border-primary-foreground/80 group-hover:scale-105">
                            <Icon
                              name="arrow-right"
                              size={20}
                              className="text-primary-foreground transition-transform duration-500 group-hover:translate-x-0.5"
                            />
                          </span>
                          <span className="text-[12px] uppercase tracking-[0.25em] font-medium font-[family-name:var(--font-rajdhani)] text-primary-foreground">
                            {viewAllText}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
