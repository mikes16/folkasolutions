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
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[calc((100%-1.25rem)/2.2)] md:w-[calc((100%-2.1rem)/3.3)] lg:w-[calc((100%-2.7rem)/4.3)] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
