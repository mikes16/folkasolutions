import type { MDXComponents } from "mdx/types";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
} from "react";

/**
 * Editorial body element overrides for MDX content (Journal, Stories, Guides).
 *
 * Server-component-friendly — no `"use client"` needed because every override
 * is a pure presentational wrapper. The map is intentionally typographic
 * rather than chrome-heavy: hairlines via `border-foreground/15`, no rounded
 * containers, no shadows, Rajdhani 300 for display, Inter for body.
 *
 * Sizing assumes the MDX renders inside an article column constrained to
 * `max-w-prose` (~65ch). Spacing rhythms favor magazine-style breathing room
 * over dense documentation.
 */

function H1({ children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className="text-3xl md:text-4xl font-[300] tracking-tight font-[family-name:var(--font-rajdhani)] mt-12 mb-6 leading-[1.1]"
      {...rest}
    >
      {children}
    </h1>
  );
}

function H2({ children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className="text-2xl md:text-3xl lg:text-4xl font-[300] tracking-tight font-[family-name:var(--font-rajdhani)] mt-16 mb-5 leading-[1.1]"
      {...rest}
    >
      {children}
    </h2>
  );
}

function H3({ children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className="text-xl md:text-2xl font-medium tracking-tight font-[family-name:var(--font-rajdhani)] mt-12 mb-4"
      {...rest}
    >
      {children}
    </h3>
  );
}

function H4({ children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className="text-lg md:text-xl font-medium tracking-tight font-[family-name:var(--font-rajdhani)] mt-10 mb-3"
      {...rest}
    >
      {children}
    </h4>
  );
}

function P({ children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className="text-base md:text-lg leading-[1.7] text-foreground/85 mb-5" {...rest}>
      {children}
    </p>
  );
}

function Blockquote({
  children,
  ...rest
}: HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className="my-8 pl-6 border-l border-foreground/20 italic text-foreground/75"
      {...rest}
    >
      {children}
    </blockquote>
  );
}

function A({
  children,
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal =
    typeof href === "string" && /^(https?:)?\/\//.test(href);
  return (
    <a
      href={href}
      className="text-foreground underline decoration-foreground/30 hover:decoration-foreground underline-offset-4 transition-colors duration-300"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

function Ul({ children, ...rest }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className="pl-6 mb-6 space-y-2 list-disc marker:text-foreground/40" {...rest}>
      {children}
    </ul>
  );
}

function Ol({ children, ...rest }: HTMLAttributes<HTMLOListElement>) {
  return (
    <ol className="pl-6 mb-6 space-y-2 list-decimal marker:text-foreground/40" {...rest}>
      {children}
    </ol>
  );
}

function Li({ children, ...rest }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li className="text-foreground/85 leading-[1.6] text-base md:text-lg" {...rest}>
      {children}
    </li>
  );
}

// Inline body images: native <img> with lazy loading. MDX doesn't pass
// width/height naturally, so next/image isn't the right tool here — use the
// dedicated TwoUpImage component when intrinsic dimensions matter.
function Img({ alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      loading="lazy"
      className="w-full my-8 block"
      {...rest}
    />
  );
}

function Hr(props: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className="border-0 border-t border-foreground/15 my-12 max-w-[200px] mx-auto"
      {...props}
    />
  );
}

function Code({ children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className="font-mono text-[0.9em] bg-foreground/5 px-1.5 py-0.5"
      {...rest}
    >
      {children}
    </code>
  );
}

function Pre({ children, ...rest }: HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className="font-mono text-sm bg-foreground/5 p-5 my-8 overflow-x-auto leading-[1.6]"
      {...rest}
    >
      {children}
    </pre>
  );
}

export const mdxComponents: MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  blockquote: Blockquote,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  img: Img,
  hr: Hr,
  code: Code,
  pre: Pre,
};

/**
 * Merges a parent component map with the editorial overrides. Use from
 * the root `mdx-components.tsx` Next.js convention file, or from a page
 * that wants to extend the defaults with custom components.
 *
 * Naming note: this is the Next.js App Router MDX convention name (see
 * `node_modules/next/dist/docs/01-app/02-guides/mdx.md`). It is NOT a
 * React hook — there is no React state, effects, or context here. The
 * `use*` prefix is convention-driven, not semantic; the framework
 * expects this exact symbol name.
 *
 * Merge order: editorial defaults are spread first so any explicit
 * parent override wins. A page passing `{ h1: CustomH1 }` should get
 * `CustomH1`, not our editorial `H1`.
 */
export function useMDXComponents(parent: MDXComponents = {}): MDXComponents {
  return { ...mdxComponents, ...parent };
}
