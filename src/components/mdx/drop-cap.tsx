import type { ReactNode } from "react";

export interface DropCapProps {
  children: ReactNode;
}

/**
 * First-letter drop cap for the opening paragraph of an article.
 *
 * Constraint: only works when `children` resolves to a string. If MDX wraps
 * the content in nested elements (links, em, etc.) the first character
 * cannot be safely extracted, so we render the paragraph normally without
 * the drop cap. Author-facing convention: keep the first sentence pure
 * text when you want the drop cap.
 *
 * Color uses Mineral Sand — a deliberate editorial accent that signals
 * "this is the article's opening" rather than a syntactic emphasis.
 */
export function DropCap({ children }: DropCapProps) {
  if (typeof children !== "string") {
    return <p className="text-base md:text-lg leading-[1.7] text-foreground/85 mb-5">{children}</p>;
  }

  const firstChar = children.charAt(0);
  const rest = children.slice(1);

  return (
    <p className="text-base md:text-lg leading-[1.7] text-foreground/85 mb-5">
      <span
        style={{
          float: "left",
          fontFamily: "var(--font-rajdhani)",
          fontWeight: 300,
          fontSize: "clamp(4rem, 8vw, 6rem)",
          lineHeight: 0.85,
          paddingRight: "0.4rem",
          paddingTop: "0.3rem",
          color: "var(--folka-mineral-sand)",
        }}
      >
        {firstChar}
      </span>
      {rest}
    </p>
  );
}
