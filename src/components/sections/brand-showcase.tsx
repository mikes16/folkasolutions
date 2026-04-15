import { Link } from "@/i18n/navigation";

interface Brand {
  name: string;
  href: string;
}

interface BrandShowcaseProps {
  heading?: string;
  brands: Brand[];
}

export function BrandShowcase({ heading, brands }: BrandShowcaseProps) {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container-page text-center">
        {heading && (
          <p className="text-[11px] uppercase tracking-[4px] font-medium text-secondary mb-10 font-[family-name:var(--font-rajdhani)]">
            {heading}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 md:gap-x-16 md:gap-y-8">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-[0.15em] text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-300 font-[family-name:var(--font-rajdhani)]"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
