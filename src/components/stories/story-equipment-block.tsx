import { ProductCallout } from "@/components/mdx/product-callout";

export interface StoryEquipmentBlockProps {
  /** Shopify product handles to feature. Missing handles render nothing. */
  handles: string[];
  eyebrow: string;
  title: string;
}

/**
 * Closing equipment block for a story detail page. Renders a 1- or 2-column
 * grid of editorial product callouts, tied to the products mentioned in the
 * piece. Server component — `<ProductCallout>` itself fetches each product
 * with the request's locale/country, so pricing matches the page context.
 *
 * Renders nothing if no handles are provided. Broken handles fail silently
 * inside `ProductCallout` — we don't break the page over a bad link.
 */
export function StoryEquipmentBlock({
  handles,
  eyebrow,
  title,
}: StoryEquipmentBlockProps) {
  if (handles.length === 0) return null;

  return (
    <section
      className="py-20 md:py-28"
      style={{
        backgroundColor: "var(--folka-midnight-blue)",
        color: "var(--folka-desert-white)",
      }}
    >
      <div className="container-page">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p
              className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)]"
              style={{ color: "var(--folka-mineral-sand)" }}
            >
              {eyebrow}
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05] mt-5"
              style={{ fontWeight: 300 }}
            >
              {title}
            </h2>
          </div>
          <div
            className={`grid gap-6 ${
              handles.length > 1
                ? "md:grid-cols-2"
                : "md:grid-cols-1 max-w-md mx-auto"
            }`}
          >
            {handles.map((handle) => (
              <ProductCallout key={handle} handle={handle} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
