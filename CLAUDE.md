# Folka Coffee Solutions — Project

@AGENTS.md
@FOLKA_BRAND_IDENTITY.md
@ENGINEERING_STANDARDS.md

## Project Overview

- **Brand:** Folka Coffee Solutions / Cafe Folka
- **Platform:** Shopify (current) — transitioning to editorial-first design
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript (strict mode)
- **Markets:** Mexico (MXN) / United States (USD)
- **Content languages:** Spanish / English

## Key Rules

1. **Design direction:** Follow the NEW editorial direction in FOLKA_BRAND_IDENTITY.md, NOT the current site style.
2. **Code quality:** Follow all SOLID principles and patterns in ENGINEERING_STANDARDS.md.
3. **Framework:** Always check `node_modules/next/dist/docs/` before writing Next.js code (see AGENTS.md).
4. **Language in code:** Code, variable names, comments, and commit messages in English.
5. **Language in content:** User-facing content in Spanish and English. Support bilingual naturally.
6. **Fonts:** Use Folka brand typography tokens. Never use default system fonts in UI.
7. **Colors:** Use Folka design tokens exclusively. Never use arbitrary hex values.
8. **Images:** Always use `next/image`, WebP/AVIF, proper alt text, and lazy loading.
9. **Accessibility:** WCAG AA minimum. Semantic HTML. Keyboard navigation.
10. **Performance:** Target Core Web Vitals green scores (LCP < 2.5s, CLS < 0.1).
11. **Punctuation in user-facing prose:** **Never** use the em-dash (`—`, U+2014) in user-visible content (MDX articles, i18n strings, JSX copy, page metadata). It reads as an "AI tell" that breaks the brand's editorial credibility. Use periods, colons, parentheses, or commas instead, picking what fits the rhythm. The middle dot interpunct (`·`) is allowed for separators (`Mon · Fri`, `Author · Affiliation`). This rule applies to ALL human-readable copy. Code comments and JSDoc are exempt — readers don't see them. When in doubt, choose the punctuation a thoughtful human author would use, not the one a model defaults to.

## Writing voice

When authoring or editing user-visible prose (MDX, i18n strings, page copy):

- Speak as a knowledgeable peer, not a salesperson. Lead with the "why" before the "what".
- Avoid model-default phrasing: "best in class", "world-class", "premium quality", "elevate your X", "unlock", "seamless", "in today's fast-paced world", "as we all know".
- Avoid the em-dash (rule 11). Other model-tells to watch: parallel triplet structures used as a tic ("X, Y, and Z"), reflexive `not just A but B` constructions, sentences that begin with "Indeed,".
- When paraphrasing an interview subject in a `<PullQuote>`, use general-truth phrasing rather than a fabricated verbatim quote. Mark attribution clearly.
- Prefer specific concrete detail (a temperature, a person's role, a real café name) over abstract aspirational claims.
