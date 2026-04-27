import type { ReactNode } from "react";

type CalloutVariant = "info" | "tip" | "note";

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const VARIANT_LABELS: Record<CalloutVariant, string> = {
  info: "INFO",
  tip: "TIP",
  note: "NOTE",
};

const EYEBROW_STYLES: Record<CalloutVariant, string> = {
  info: "text-foreground/55",
  // Mineral Sand accent — the only variant with an explicit brand-color
  // signal, reserved for moments when the editor wants extra weight.
  tip: "",
  note: "text-foreground/40",
};

/**
 * Editorial side-note. Hairline left edge only — no rounded SaaS-alert
 * container. The variant differentiates via eyebrow color, not chrome.
 *
 * The `variant` controls the eyebrow label too. If the consumer wants
 * localized labels, they should pass `title` and ignore the eyebrow as
 * decoration.
 */
export function Callout({
  variant = "info",
  title,
  children,
}: CalloutProps) {
  const eyebrowClass = EYEBROW_STYLES[variant];
  const eyebrowStyle =
    variant === "tip" ? { color: "var(--folka-mineral-sand)" } : undefined;

  return (
    <aside className="border-l-2 border-foreground/30 pl-6 my-8">
      <p
        className={`text-[10px] uppercase tracking-[3px] font-[family-name:var(--font-rajdhani)] font-medium ${eyebrowClass}`}
        style={eyebrowStyle}
      >
        {VARIANT_LABELS[variant]}
      </p>
      {title && (
        <p className="text-base font-medium text-foreground mt-1 mb-2">
          {title}
        </p>
      )}
      <div className="text-base leading-[1.6] text-foreground/80">
        {children}
      </div>
    </aside>
  );
}
