# Engineering & Design Standards

## Core Philosophy

Write code that is readable, maintainable, and scalable. Favor clarity over cleverness. Every file, function, and component should have a single clear purpose. Code is read far more often than it is written — optimize for the reader.

---

## SOLID Principles

### Single Responsibility (SRP)
- Every module, class, or component does ONE thing well.
- If you need the word "and" to describe what it does, split it.
- Components: separate data fetching, business logic, and presentation.

```typescript
// BAD: Component does fetching, filtering, AND rendering
function ProductPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  useEffect(() => { fetch('/api/products').then(...)}, []);
  const filtered = products.filter(p => p.name.includes(filter));
  return <div>{filtered.map(p => <div>...</div>)}</div>
}

// GOOD: Responsibilities separated
function ProductPage() {
  const { products, isLoading } = useProducts();
  const { filtered, setFilter } = useProductFilter(products);
  return <ProductList products={filtered} onFilterChange={setFilter} />;
}
```

### Open/Closed (OCP)
- Open for extension, closed for modification.
- Use composition, props, and configuration over editing existing code.
- Prefer polymorphism and strategy patterns over switch/if chains.

```typescript
// BAD: Must modify function to add new payment methods
function processPayment(type: string, amount: number) {
  if (type === 'stripe') { /* ... */ }
  else if (type === 'paypal') { /* ... */ }
  else if (type === 'oxxo') { /* ... */ }
}

// GOOD: Extensible via strategy pattern
const paymentProcessors: Record<string, PaymentProcessor> = {
  stripe: new StripeProcessor(),
  paypal: new PayPalProcessor(),
  oxxo: new OxxoProcessor(),
};

function processPayment(type: string, amount: number) {
  return paymentProcessors[type].process(amount);
}
```

### Liskov Substitution (LSP)
- Subtypes must be substitutable for their base types without breaking behavior.
- If a component accepts a prop type, any subtype should work identically.
- Never override inherited behavior in a way that surprises the consumer.

### Interface Segregation (ISP)
- Don't force components or modules to depend on interfaces they don't use.
- Keep prop interfaces focused — split large prop objects into smaller, specific ones.
- Prefer multiple small hooks over one monolithic hook.

```typescript
// BAD: Component receives props it doesn't need
interface ProductProps {
  product: Product;
  onAddToCart: () => void;
  onWishlist: () => void;
  analytics: AnalyticsClient;
  userPermissions: Permissions;
}

// GOOD: Only what it needs
interface ProductCardProps {
  name: string;
  price: number;
  imageUrl: string;
  onAddToCart: () => void;
}
```

### Dependency Inversion (DIP)
- High-level modules should not depend on low-level modules. Both depend on abstractions.
- Components should depend on interfaces/types, not concrete implementations.
- Inject dependencies — don't hardcode them.

```typescript
// BAD: Tight coupling to a specific API client
function useProducts() {
  return fetch('/api/products').then(res => res.json());
}

// GOOD: Depends on abstraction
function useProducts(client: ApiClient = defaultClient) {
  return client.get<Product[]>('/products');
}
```

---

## Clean Code Practices

### Naming Conventions
- **Variables/functions:** camelCase, descriptive verbs for functions (`getProducts`, `handleSubmit`, `formatPrice`)
- **Components:** PascalCase, noun-based (`ProductCard`, `CheckoutForm`, `NavigationBar`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Types/Interfaces:** PascalCase, no `I` prefix (`Product`, not `IProduct`)
- **Files:** Match export name — `ProductCard.tsx` exports `ProductCard`
- **Boolean variables:** Use `is`, `has`, `should`, `can` prefixes (`isLoading`, `hasError`, `canEdit`)
- **Event handlers:** Use `handle` prefix in component, `on` prefix in props (`handleClick` internally, `onClick` as prop)

### Functions
- Maximum ~20 lines per function. If longer, extract helpers.
- Maximum 3 parameters. Use an options object for more.
- Pure functions wherever possible — same input, same output, no side effects.
- Return early to avoid deep nesting.

```typescript
// BAD: Deep nesting
function getDiscount(user: User) {
  if (user) {
    if (user.isPremium) {
      if (user.orders > 10) {
        return 0.2;
      } else {
        return 0.1;
      }
    } else {
      return 0.05;
    }
  }
  return 0;
}

// GOOD: Early returns
function getDiscount(user: User | null): number {
  if (!user) return 0;
  if (!user.isPremium) return 0.05;
  if (user.orders > 10) return 0.2;
  return 0.1;
}
```

### Error Handling
- Never swallow errors silently. Always log or propagate.
- Use typed errors when possible.
- Handle errors at the appropriate boundary — not too deep, not too shallow.
- Provide meaningful error messages for debugging AND for users.
- Use error boundaries in React for graceful UI fallbacks.

### Comments
- Code should be self-documenting. If you need a comment, first try renaming.
- Comment the **WHY**, never the **WHAT**.
- Use JSDoc for public APIs, utilities, and non-obvious function signatures.
- Delete commented-out code — that's what git is for.
- TODO comments must include context: `// TODO(miguel): Refactor when Shopify API v2 launches`

---

## TypeScript Standards

- **Strict mode always** — `strict: true` in tsconfig.
- **No `any`** — use `unknown` and narrow with type guards. If truly needed, add a comment explaining why.
- **Prefer `interface` for object shapes**, `type` for unions, intersections, and computed types.
- **Use discriminated unions** for state machines and variant types.
- **Const assertions** for literal types: `as const`.
- **Generic constraints** — always constrain generics: `<T extends Product>` not just `<T>`.
- **Utility types** — use `Pick`, `Omit`, `Partial`, `Required`, `Record` from stdlib before writing custom types.

```typescript
// Discriminated union for component states
type ProductState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Product[] }
  | { status: 'error'; error: Error };

// Exhaustive switch
function renderProducts(state: ProductState) {
  switch (state.status) {
    case 'idle': return null;
    case 'loading': return <Skeleton />;
    case 'success': return <ProductGrid products={state.data} />;
    case 'error': return <ErrorMessage error={state.error} />;
  }
}
```

---

## React & Next.js Patterns

### Component Architecture
- **Atomic Design hierarchy:** Atoms → Molecules → Organisms → Templates → Pages.
- **Container/Presentation split:** Separate data logic from UI rendering.
- **Composition over inheritance:** Use children, render props, and slots.
- **Co-locate related files:** Component, styles, tests, and types in the same folder.

```
components/
  ProductCard/
    ProductCard.tsx        # Component
    ProductCard.styles.ts  # Styles (if CSS-in-JS)
    ProductCard.test.tsx   # Tests
    ProductCard.types.ts   # Types (if complex)
    index.ts               # Re-export
```

### Hooks
- Custom hooks extract reusable logic — prefix with `use`.
- One concern per hook.
- Hooks should return typed objects, not arrays (except simple [value, setter] patterns).
- Always handle loading, error, and empty states.

```typescript
function useProducts(categoryId: string) {
  // Returns a well-defined object
  return {
    products,
    isLoading,
    error,
    isEmpty: !isLoading && products.length === 0,
    refetch,
  };
}
```

### State Management
- **Local state first** — useState/useReducer for component-specific state.
- **Lift state only when needed** — don't hoist prematurely.
- **Server state ≠ client state** — use React Query / SWR for server data.
- **URL as state** — search filters, pagination, and view modes belong in the URL.
- **Context for truly global data** — theme, locale, auth. NOT for frequently-updating data.

### Performance
- **Memoize expensive computations** with `useMemo`.
- **Memoize callbacks** passed to child components with `useCallback`.
- **Lazy load** routes and heavy components with `React.lazy` / `next/dynamic`.
- **Virtualize long lists** — never render 500+ items in the DOM.
- **Optimize images** — always use `next/image` with proper sizing and formats.
- **Avoid layout shifts** — always set dimensions on images and media.

---

## CSS & Styling

### Methodology
- **Utility-first with Tailwind CSS** as default approach.
- Use `@apply` sparingly — only for truly repeated patterns.
- Component-scoped styles for complex, unique components.
- Design tokens via CSS custom properties for theming.

### Responsive Design
- **Mobile-first** — base styles are mobile, add complexity upward.
- Use Tailwind breakpoints consistently: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- Test all breakpoints — don't assume intermediate sizes work.
- Fluid typography with `clamp()` for smooth scaling.

```css
/* Fluid typography */
.heading {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```

### Animation & Motion
- Prefer CSS transitions and animations over JS-driven animation.
- Use `transform` and `opacity` for performant animations (GPU-accelerated).
- Respect `prefers-reduced-motion` — always provide a reduced-motion fallback.
- Subtle, purposeful animations only — never decorative motion that slows UX.

---

## Project Structure (Next.js)

```
src/
  app/                    # Next.js App Router pages and layouts
    (marketing)/          # Route group: landing, about, blog
    (shop)/               # Route group: products, cart, checkout
    layout.tsx            # Root layout
    globals.css           # Global styles and Tailwind imports
  components/
    ui/                   # Primitive UI components (Button, Input, Card)
    features/             # Feature-specific components (ProductGrid, CartDrawer)
    layout/               # Layout components (Header, Footer, Sidebar)
  hooks/                  # Custom React hooks
  lib/                    # Utilities, API clients, helpers
    shopify/              # Shopify API client and helpers
    utils/                # Pure utility functions
    constants.ts          # App-wide constants
  types/                  # Shared TypeScript types and interfaces
  styles/                 # Additional style files, tokens
  config/                 # App configuration
```

### File Organization Rules
- **Feature-first, not type-first** — group by feature, not by file type.
- **Barrel exports** — each folder has an `index.ts` that re-exports public API.
- **No circular dependencies** — enforce with ESLint rules.
- **Colocation** — tests, types, and styles live next to their component.
- **Absolute imports** — use `@/` path alias, never relative paths beyond one level (`../`).

---

## API & Data Layer

### Data Fetching Patterns
- **Server Components** for data that doesn't need interactivity.
- **React Query / SWR** for client-side data with caching, revalidation, optimistic updates.
- **API route handlers** for server-side logic and third-party API proxying.
- **Never expose API keys** to the client — always proxy through server routes.

### API Design
- Consistent error response shapes across all endpoints.
- Validate inputs with Zod schemas at the boundary.
- Use proper HTTP status codes.
- Paginate all list endpoints.

```typescript
// Zod validation at API boundary
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = CreateProductSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  
  // Proceed with validated data
  const product = await createProduct(result.data);
  return Response.json(product, { status: 201 });
}
```

---

## Testing

- **Test behavior, not implementation** — test what the user sees and does.
- **Testing trophy:** Many integration tests, some unit tests, few E2E tests.
- **Name tests as sentences:** `it('shows error message when payment fails')`.
- **Arrange → Act → Assert** structure in every test.
- **Mock at the boundary** — mock API calls and external services, not internal modules.
- **No snapshot tests** unless for regression of complex SVGs or serialized data.

---

## Git & Workflow

- **Conventional commits:** `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`
- **Small, focused commits** — one logical change per commit.
- **Branch naming:** `feat/product-grid`, `fix/cart-total`, `refactor/checkout-flow`
- **Never commit:** `.env` files, `node_modules`, build artifacts, API keys, secrets.

---

## Accessibility (a11y)

- **Semantic HTML first** — use the right element (`button`, `nav`, `main`, `article`).
- **ARIA only when HTML isn't enough** — don't add `role="button"` to a `<button>`.
- **Keyboard navigation** — every interactive element must be keyboard-accessible.
- **Color contrast** — minimum 4.5:1 for text, 3:1 for large text (WCAG AA).
- **Alt text on all images** — descriptive for content images, empty (`alt=""`) for decorative.
- **Focus management** — visible focus indicators, logical tab order.
- **Screen reader testing** — test with VoiceOver or NVDA periodically.

---

## Security

- **Sanitize all user input** — never render raw HTML from user or API data.
- **CSRF protection** on all state-changing endpoints.
- **Environment variables** for all secrets — never hardcode.
- **Content Security Policy** headers in production.
- **Dependency auditing** — run `npm audit` regularly, update vulnerable packages.
- **Rate limiting** on API routes that accept user input.

---

## Performance Budgets

- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Total bundle size:** < 200KB initial JS (gzipped)
- **Images:** Always use WebP/AVIF, lazy load below the fold, proper srcset.
- **Fonts:** Subset, preload, use `font-display: swap`.

---

## Design System Tokens (Folka-specific)

```typescript
// Design tokens aligned with Folka brand
export const tokens = {
  colors: {
    primary: '#101C2E',       // Midnight Blue
    secondary: '#F2EDE3',     // Desert White
    accent: '#B5A88A',        // Mineral Sand
    text: {
      primary: '#101C2E',
      secondary: '#6B7280',
      inverse: '#F2EDE3',
    },
    surface: {
      light: '#F2EDE3',
      dark: '#101C2E',
      accent: '#B5A88A',
    },
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px — editorial spacing
    '5xl': '8rem',    // 128px — hero sections
  },
  typography: {
    fontFamily: {
      heading: "'Rajdhani', 'Barlow', sans-serif",
      body: "'Inter', 'DM Sans', sans-serif",
    },
    letterSpacing: {
      normal: '0.05em',
      wide: '0.15em',
      wider: '0.25em',   // Brand headings
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  transition: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
} as const;
```
