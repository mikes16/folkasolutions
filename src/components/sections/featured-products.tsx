import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";

interface FeaturedProductsProps {
  title: string;
  linkText: string;
  products: Product[];
}

export function FeaturedProducts({
  title,
  linkText,
  products,
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="container-page py-20">
      <SectionHeading
        title={title}
        href="/new-arrivals"
        linkText={linkText}
        accent
      />
      {/* Mobile: horizontal scroll showing ~2.5 items. Desktop (lg+): 4-col grid. */}
      <div className="-mx-5 md:-mx-10 lg:mx-0">
        <div
          className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-10 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scroll-pl-5 md:scroll-pl-10 lg:scroll-pl-0 px-5 md:px-10 lg:px-0 pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[calc((100%-2rem)/2.5)] lg:w-auto snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
