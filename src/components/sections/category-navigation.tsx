import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface Category {
  label: string;
  href: string;
  imageUrl?: string;
}

interface CategoryNavigationProps {
  eyebrow?: string;
  categories: Category[];
}

export function CategoryNavigation({ eyebrow, categories }: CategoryNavigationProps) {
  return (
    <section className="border-t border-border py-10 md:py-14 lg:py-16">
      <div className="container-page">
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[4px] font-medium text-muted text-center mb-6 md:mb-8 lg:mb-10 font-[family-name:var(--font-rajdhani)]">
            {eyebrow}
          </p>
        )}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-3 md:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group flex flex-col items-center gap-3 md:gap-4"
            >
              <div className="w-[88px] h-[88px] md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border border-border/60 flex items-center justify-center group-hover:border-foreground/40 group-hover:bg-foreground/[0.03] transition-all duration-300">
                <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-[100px] lg:h-[100px]">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.label}
                      fill
                      sizes="(max-width: 768px) 48px, 80px"
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-accent/20" />
                  )}
                </div>
              </div>
              <span className="text-[10px] md:text-[12px] uppercase tracking-[2px] font-semibold text-foreground font-[family-name:var(--font-rajdhani)] group-hover:text-foreground/70 transition-colors duration-300">
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
