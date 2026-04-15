import Image from "next/image";

interface TrustItem {
  label: string;
  imageUrl: string;
}

interface TrustStripProps {
  items: TrustItem[];
}

export function TrustStrip({ items }: TrustStripProps) {
  return (
    <section className="border-y border-border bg-card/40 py-12 md:py-16">
      <div className="container-page">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-x-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-4 md:border-r md:border-border md:last:border-r-0 md:px-4"
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
              <span className="text-[11px] md:text-[12px] uppercase tracking-[1.5px] font-medium text-foreground leading-snug font-[family-name:var(--font-rajdhani)]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
