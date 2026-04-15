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
