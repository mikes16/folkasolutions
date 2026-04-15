import { Link } from "@/i18n/navigation";

interface Brand {
  name: string;
  href: string;
}

interface BrandLogosProps {
  eyebrow?: string;
  brands: Brand[];
}

export function BrandLogos({ eyebrow, brands }: BrandLogosProps) {
  const linkClass =
    "text-base md:text-lg lg:text-xl font-bold uppercase tracking-[0.12em] text-foreground/30 hover:text-foreground transition-colors duration-300 font-[family-name:var(--font-rajdhani)] whitespace-nowrap";

  return (
    <section className="border-y border-border py-12 md:py-16">
      {eyebrow && (
        <div className="container-page">
          <p className="text-[10px] uppercase tracking-[4px] font-medium text-muted text-center mb-8 font-[family-name:var(--font-rajdhani)]">
            {eyebrow}
          </p>
        </div>
      )}

      {/* Mobile: continuous marquee. Desktop (md+): centered flex-wrap. */}
      <div
        className="md:hidden relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          className="flex w-max gap-x-10"
          style={{ animation: "brand-marquee 40s linear infinite" }}
        >
          {[...brands, ...brands].map((brand, i) => (
            <Link
              key={`${brand.name}-${i}`}
              href={brand.href}
              className={linkClass}
              title={brand.name}
              aria-hidden={i >= brands.length ? "true" : undefined}
              tabIndex={i >= brands.length ? -1 : undefined}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden md:block container-page">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14 lg:gap-x-20">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className={linkClass}
              title={brand.name}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
