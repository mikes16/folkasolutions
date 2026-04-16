import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "@/components/product/product-card";
import { Link } from "@/i18n/navigation";

interface HomeBarFavoritesProps {
  eyebrow: string;
  title: string;
  description: string;
  viewAllText: string;
  products: Product[];
}

/**
 * Editorial section: curated bestsellers for the home bar.
 * Visual treatment deliberately distinct from <FeaturedProducts /> (New Arrivals)
 * to avoid a stacked-catalog feel:
 *   - Mineral Sand tinted background delimits the section as a "chapter".
 *   - Eyebrow + descriptive subtitle frame it as editorial, not a grid dump.
 *   - Horizontal scroll on desktop keeps the rhythm cinematic even with 8 items.
 */
export function HomeBarFavorites({
  eyebrow,
  title,
  description,
  viewAllText,
  products,
}: HomeBarFavoritesProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-[color:var(--folka-mineral-sand)]/15 py-20 md:py-24">
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted mb-4">
              {eyebrow}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
              {title}
            </h2>
            <div className="w-10 h-0.5 bg-secondary mt-3 mb-5" />
            <p className="text-muted leading-relaxed">{description}</p>
          </div>
          <Link
            href="/collections/best-seller"
            className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted hover:text-foreground border-b border-transparent hover:border-foreground pb-1 transition-all duration-300 self-start md:self-end whitespace-nowrap"
          >
            {viewAllText}
          </Link>
        </div>

        {/* Horizontal scroll carousel — 2.5 per view on mobile, 4 per view on desktop. */}
        <div className="-mx-5 md:-mx-10 lg:-mx-12">
          <div className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory scroll-pl-5 md:scroll-pl-10 lg:scroll-pl-12 px-5 md:px-10 lg:px-12 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[calc((100%-2rem)/2.5)] md:w-[calc((100%-2rem)/3.5)] lg:w-[calc((100%-6rem)/4)] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
