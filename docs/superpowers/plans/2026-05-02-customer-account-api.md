# Customer Account API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Shopify-hosted login, account dashboard, and order screens with custom Next.js UI that talks to Shopify's Customer Account API. Eliminates the visual handoff to `account.folkasolutions.com` and `cafe-folka.myshopify.com`, removes the patchwork redirects we wired up to keep the Shopify-hosted flows alive, and gives the editorial design language a home in the post-purchase experience.

**Architecture:** Clean Architecture with strict layer separation. Domain entities (`Customer`, `Order`, `Address`, `Email`) are pure TypeScript with no framework imports. Application use cases (`LoginCustomer`, `GetOrders`, `UpdateProfile`) declare ports they depend on. Adapters implement those ports against Shopify's Customer Account GraphQL API and Next.js cookies. UI consumes presenters via Server Components for reads, Server Actions for writes. OAuth 2.0 + PKCE flow with refresh tokens stored in HTTP-only cookies.

**Tech Stack:** Next.js 16 App Router (RSC + Server Actions), TypeScript strict, Tailwind CSS, next-intl, Vitest for unit tests, Playwright for E2E, Zod for validation, `jose` for JWT handling. OAuth implemented hand-rolled (Task 14) rather than via Shopify's helper package, since the helpers don't ship for Node-only server runtimes and we control the cookie/session contract anyway.

**Scope:** Login, signup (account creation via OAuth), password recovery (delegated to Shopify's hosted reset flow on the OAuth provider, NOT custom UI), account dashboard, order history, order detail, profile editing, address book, logout. Out of scope: checkout customization (requires Shopify Plus), Shop Pay social login custom UI (delegated), customer wishlist/favorites, B2B catalogs.

**Timing:** Post-launch roadmap (target Q3 2026). Not a blocker for the May 2026 go-live. Each phase produces working, deployable software so the rollout can be staged.

---

## Prerequisites (Manual Shopify Admin Setup)

Before any code work, complete these in Shopify Admin. These are NOT TDD-able — verify by clicking through.

- [ ] **P1:** In Shopify Admin → Configuración → Cuentas de cliente, confirm "New customer accounts" is enabled (it is — we already use it via `account.folkasolutions.com`).

- [ ] **P2:** In Shopify Admin → Apps → Develop apps → Create app, name it "Folka Headless Customer Account". Under Configuration → Customer Account API, click "Configure".
  - Required scopes: `customer-account-api:full` (read + write profile, orders, addresses).
  - OAuth redirect URLs (whitelist all three so Preview deploys work):
    - `https://folkasolutions.com/api/auth/customer/callback`
    - `https://folkasolutions.vercel.app/api/auth/customer/callback`
    - `http://localhost:3000/api/auth/customer/callback`
  - Save. Copy the **Client ID** (UUID format) — paste into `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` env var locally.
  - Note the **Customer Account API endpoint** — looks like `https://shopify.com/<shop-id>/account/customer/api/2026-01/graphql` — paste into `SHOPIFY_CUSTOMER_ACCOUNT_API_URL`.
  - Note the **Authorization endpoint** — `https://shopify.com/authentication/<shop-id>/oauth/authorize` — paste into `SHOPIFY_CUSTOMER_AUTH_URL`.
  - Note the **Token endpoint** — `https://shopify.com/authentication/<shop-id>/oauth/token` — paste into `SHOPIFY_CUSTOMER_TOKEN_URL`.
  - Note the **Logout endpoint** — `https://shopify.com/authentication/<shop-id>/logout` — paste into `SHOPIFY_CUSTOMER_LOGOUT_URL`.

- [ ] **P3:** Add the same env vars to Vercel (Production + Preview):
  - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` (Sensitive)
  - `SHOPIFY_CUSTOMER_ACCOUNT_API_URL`
  - `SHOPIFY_CUSTOMER_AUTH_URL`
  - `SHOPIFY_CUSTOMER_TOKEN_URL`
  - `SHOPIFY_CUSTOMER_LOGOUT_URL`
  - `CUSTOMER_SESSION_SECRET` — generate with `openssl rand -base64 32` (Sensitive). Used to sign session cookies.

- [ ] **P4:** Update `.env.example` with the same keys (no values — placeholders only).

---

## Architecture Overview

```
src/
├── domain/customer/                # Pure business rules. Zero framework imports.
│   ├── Customer.ts                 # Entity
│   ├── CustomerId.ts               # Value object
│   ├── Email.ts                    # Value object with validation
│   ├── Address.ts                  # Value object
│   ├── Order.ts                    # Entity (post-purchase view)
│   ├── OrderLineItem.ts            # Value object
│   ├── Money.ts                    # Value object (already exists in commerce/types — reuse)
│   └── errors.ts                   # InvalidEmailError, CustomerNotFoundError, AuthExpiredError
│
├── application/customer/           # Use cases + ports.
│   ├── LoginCustomer.ts            # Use case: build OAuth URL, return for redirect
│   ├── HandleOAuthCallback.ts      # Use case: exchange code → tokens → store
│   ├── RefreshAccessToken.ts       # Use case: refresh expiring access token
│   ├── LogoutCustomer.ts           # Use case: revoke tokens + clear session
│   ├── GetCustomerProfile.ts       # Use case
│   ├── UpdateCustomerProfile.ts    # Use case
│   ├── GetCustomerOrders.ts        # Use case (paginated)
│   ├── GetOrderDetail.ts           # Use case
│   ├── ListCustomerAddresses.ts    # Use case
│   ├── CreateCustomerAddress.ts    # Use case
│   ├── UpdateCustomerAddress.ts    # Use case
│   ├── DeleteCustomerAddress.ts    # Use case
│   └── ports.ts                    # CustomerAccountGateway, SessionStore, OAuthClient
│
├── adapters/customer/              # Implementations of ports.
│   ├── ShopifyOAuthClient.ts       # Hits Shopify auth/token endpoints
│   ├── ShopifyCustomerAccountGateway.ts  # GraphQL queries/mutations
│   ├── CookieSessionStore.ts       # HTTP-only signed cookies
│   ├── mappers.ts                  # GraphQL response → domain entities
│   └── presenters.ts               # Domain → JSON DTOs for client components
│
├── infrastructure/customer/        # Composition root + crypto helpers.
│   ├── container.ts                # Wires concrete adapters to use cases
│   ├── pkce.ts                     # PKCE code verifier/challenge generation
│   └── session.ts                  # Cookie signing/parsing
│
└── app/                            # Next.js routes — UI layer.
    ├── api/auth/customer/
    │   ├── login/route.ts          # Initiates OAuth: builds URL, sets PKCE cookie, redirects
    │   ├── callback/route.ts       # Handles OAuth callback: exchanges code, sets session
    │   ├── refresh/route.ts        # Refreshes access token (used by middleware on expiry)
    │   └── logout/route.ts         # Clears session, redirects to Shopify logout endpoint
    └── [locale]/account/
        ├── layout.tsx              # Auth-required layout. Sidebar nav. Logged-out → redirect to /account/login.
        ├── page.tsx                # Dashboard overview (recent order, profile snippet, address default)
        ├── login/page.tsx          # Login intro page (wraps /api/auth/customer/login redirect)
        ├── orders/
        │   ├── page.tsx            # Paginated order list
        │   └── [id]/page.tsx       # Order detail
        ├── profile/page.tsx        # Edit name, phone, marketing prefs
        └── addresses/
            ├── page.tsx            # Address list + delete
            ├── new/page.tsx        # Create
            └── [id]/edit/page.tsx  # Edit
```

**Dependency rule check:** `grep -r "from \"next\\|from \"react\\|@shopify" src/domain/` must return zero results. Same for `src/application/` (except importing types from `src/domain/`).

---

## Design System Reference (UI tasks must conform)

Folka tokens are already defined in [tailwind.config.ts](../../../tailwind.config.ts) and [globals.css](../../../src/app/globals.css). The account screens MUST use these. No new colors, no new fonts, no `shadow-md rounded-xl` on every card.

**Colors (semantic tokens):**
- `--folka-midnight-blue` (#101C2E) — primary text, primary buttons, dark surfaces
- `--folka-desert-white` (#F2EDE3) — paper, light surfaces, dark-mode text
- `--folka-mineral-sand` (#B5A88A) — accents, borders, secondary surfaces
- Error: `oklch(50% 0.18 28)` — restrained brick red, NOT bright red
- Success: `oklch(45% 0.12 145)` — muted forest green, NOT mint

**Typography:**
- Display: **Rajdhani** 600/700, uppercase, tracking-[0.15em] for h1/h2
- Body: **Inter** 400/500
- Type scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64 (Rule of Four per screen — pick 4 sizes max)

**Spacing:** 8pt grid. Tailwind defaults align (`gap-2` = 8px, `gap-4` = 16px, etc.). Never arbitrary values like `p-[13px]`.

**Layout:** Editorial / asymmetric. Account sidebar on desktop (left rail, 240px wide, Desert White background, Midnight Blue text). Content area Desert White on mobile, two-tone on desktop (sidebar dark blue, content paper). DO NOT center everything. Hero text offset to the left third on the dashboard.

**Motion:** 150–200ms for hovers, 250–400ms for route transitions. `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). Respect `prefers-reduced-motion` — wrap non-essential transitions in the media query.

**Accessibility:**
- WCAG 2.2 AA contrast (4.5:1 body, 3:1 UI)
- Visible focus rings (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground` — pattern already used in header)
- Keyboard navigation
- Screen reader labels on all icon-only buttons
- Form errors associated via `aria-describedby`
- One `<h1>` per route, no skipped levels

**Form pattern:**
- Visible labels (NOT placeholder-only)
- Helper text below input where ambiguity exists
- Inline validation on **blur**, not keystroke
- Error message below the field with `role="alert"` and `aria-live="polite"`
- After submit error, focus moves to first invalid field
- Loading state: button disabled + spinner. NO skeleton UI for forms — they're not slow.

---

## Phase 1: Domain Layer

Pure TypeScript, no I/O, no framework imports. Tests run in Node with no setup.

### Task 1: `Email` value object

**Files:**
- Create: `src/domain/customer/Email.ts`
- Create: `src/domain/customer/Email.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/domain/customer/Email.test.ts
import { describe, it, expect } from "vitest";
import { Email } from "./Email";
import { InvalidEmailError } from "./errors";

describe("Email", () => {
  it("accepts a valid address", () => {
    const email = Email.from("hola@folkasolutions.com");
    expect(email.value).toBe("hola@folkasolutions.com");
  });

  it("normalizes by trimming and lowercasing", () => {
    const email = Email.from("  HOLA@FOLKASOLUTIONS.COM  ");
    expect(email.value).toBe("hola@folkasolutions.com");
  });

  it("rejects strings without @", () => {
    expect(() => Email.from("not-an-email")).toThrow(InvalidEmailError);
  });

  it("rejects empty string", () => {
    expect(() => Email.from("")).toThrow(InvalidEmailError);
  });

  it("considers two Emails equal when their normalized values match", () => {
    const a = Email.from("hola@folka.com");
    const b = Email.from("HOLA@folka.com");
    expect(a.equals(b)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test and verify failure**

Run: `npx vitest run src/domain/customer/Email.test.ts`
Expected: FAIL with "Cannot find module './Email'".

- [ ] **Step 3: Implement `errors.ts`**

```typescript
// src/domain/customer/errors.ts
export class InvalidEmailError extends Error {
  readonly code = "INVALID_EMAIL";
  constructor(value: string) {
    super(`"${value}" is not a valid email address`);
    this.name = "InvalidEmailError";
  }
}

export class CustomerNotFoundError extends Error {
  readonly code = "CUSTOMER_NOT_FOUND";
  constructor() {
    super("Customer not found");
    this.name = "CustomerNotFoundError";
  }
}

export class AuthExpiredError extends Error {
  readonly code = "AUTH_EXPIRED";
  constructor() {
    super("Authentication session has expired");
    this.name = "AuthExpiredError";
  }
}

export class AuthRequiredError extends Error {
  readonly code = "AUTH_REQUIRED";
  constructor() {
    super("Authentication is required for this action");
    this.name = "AuthRequiredError";
  }
}
```

- [ ] **Step 4: Implement `Email.ts`**

```typescript
// src/domain/customer/Email.ts
import { InvalidEmailError } from "./errors";

const PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(readonly value: string) {}

  static from(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!PATTERN.test(normalized)) {
      throw new InvalidEmailError(raw);
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

- [ ] **Step 5: Run test and verify pass**

Run: `npx vitest run src/domain/customer/Email.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/domain/customer/Email.ts src/domain/customer/Email.test.ts src/domain/customer/errors.ts
git commit -m "feat(customer): add Email value object with validation"
```

### Task 2: `CustomerId` value object

**Files:**
- Create: `src/domain/customer/CustomerId.ts`
- Create: `src/domain/customer/CustomerId.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/domain/customer/CustomerId.test.ts
import { describe, it, expect } from "vitest";
import { CustomerId } from "./CustomerId";

describe("CustomerId", () => {
  it("wraps a Shopify GID string", () => {
    const id = CustomerId.from("gid://shopify/Customer/123456789");
    expect(id.value).toBe("gid://shopify/Customer/123456789");
  });

  it("rejects empty string", () => {
    expect(() => CustomerId.from("")).toThrow();
  });

  it("rejects strings that don't look like Shopify GIDs", () => {
    expect(() => CustomerId.from("just-a-number")).toThrow();
  });

  it("treats two ids with the same value as equal", () => {
    const a = CustomerId.from("gid://shopify/Customer/1");
    const b = CustomerId.from("gid://shopify/Customer/1");
    expect(a.equals(b)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npx vitest run src/domain/customer/CustomerId.test.ts`
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement**

```typescript
// src/domain/customer/CustomerId.ts
const GID_PATTERN = /^gid:\/\/shopify\/Customer\/\d+$/;

export class CustomerId {
  private constructor(readonly value: string) {}

  static from(raw: string): CustomerId {
    if (!GID_PATTERN.test(raw)) {
      throw new Error(`Invalid CustomerId: "${raw}"`);
    }
    return new CustomerId(raw);
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value;
  }
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npx vitest run src/domain/customer/CustomerId.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/domain/customer/CustomerId.ts src/domain/customer/CustomerId.test.ts
git commit -m "feat(customer): add CustomerId value object"
```

### Task 3: `Address` value object

**Files:**
- Create: `src/domain/customer/Address.ts`
- Create: `src/domain/customer/Address.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/domain/customer/Address.test.ts
import { describe, it, expect } from "vitest";
import { Address } from "./Address";

describe("Address", () => {
  it("constructs from required fields", () => {
    const addr = Address.create({
      firstName: "Miguel",
      lastName: "López",
      address1: "Av. Eugenio Garza Sada 6518",
      city: "Monterrey",
      countryCode: "MX",
      zip: "64960",
      provinceCode: "NLE",
      phone: "+528112345678",
    });
    expect(addr.address1).toBe("Av. Eugenio Garza Sada 6518");
    expect(addr.countryCode).toBe("MX");
  });

  it("formats a single-line representation for display", () => {
    const addr = Address.create({
      firstName: "Miguel",
      lastName: "López",
      address1: "Av. Eugenio Garza Sada 6518",
      city: "Monterrey",
      countryCode: "MX",
      zip: "64960",
      provinceCode: "NLE",
    });
    expect(addr.formatSingleLine()).toBe(
      "Av. Eugenio Garza Sada 6518, Monterrey, NLE 64960, MX",
    );
  });

  it("includes apartment when present", () => {
    const addr = Address.create({
      firstName: "Miguel",
      lastName: "López",
      address1: "Av. Eugenio Garza Sada 6518",
      address2: "Depto 401",
      city: "Monterrey",
      countryCode: "MX",
      zip: "64960",
      provinceCode: "NLE",
    });
    expect(addr.formatSingleLine()).toContain("Depto 401");
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npx vitest run src/domain/customer/Address.test.ts`

- [ ] **Step 3: Implement**

```typescript
// src/domain/customer/Address.ts
export interface AddressInput {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  provinceCode: string;
  countryCode: string;
  zip: string;
  phone?: string;
}

export class Address {
  private constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly company: string | null,
    readonly address1: string,
    readonly address2: string | null,
    readonly city: string,
    readonly provinceCode: string,
    readonly countryCode: string,
    readonly zip: string,
    readonly phone: string | null,
  ) {}

  static create(input: AddressInput): Address {
    return new Address(
      input.firstName,
      input.lastName,
      input.company ?? null,
      input.address1,
      input.address2 ?? null,
      input.city,
      input.provinceCode,
      input.countryCode,
      input.zip,
      input.phone ?? null,
    );
  }

  formatSingleLine(): string {
    const parts = [
      this.address1,
      this.address2,
      `${this.city}, ${this.provinceCode} ${this.zip}`,
      this.countryCode,
    ].filter((p): p is string => Boolean(p));
    return parts.join(", ");
  }
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npx vitest run src/domain/customer/Address.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/domain/customer/Address.ts src/domain/customer/Address.test.ts
git commit -m "feat(customer): add Address value object"
```

### Task 4: `Customer` entity

**Files:**
- Create: `src/domain/customer/Customer.ts`
- Create: `src/domain/customer/Customer.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/domain/customer/Customer.test.ts
import { describe, it, expect } from "vitest";
import { Customer } from "./Customer";
import { CustomerId } from "./CustomerId";
import { Email } from "./Email";

describe("Customer", () => {
  const baseInput = {
    id: CustomerId.from("gid://shopify/Customer/1"),
    email: Email.from("miguel@folka.com"),
    firstName: "Miguel",
    lastName: "López",
    phone: "+528112345678",
    acceptsMarketing: false,
  };

  it("constructs with required fields", () => {
    const c = Customer.create(baseInput);
    expect(c.email.value).toBe("miguel@folka.com");
    expect(c.firstName).toBe("Miguel");
  });

  it("computes display name", () => {
    const c = Customer.create(baseInput);
    expect(c.displayName).toBe("Miguel López");
  });

  it("falls back to email when name is missing", () => {
    const c = Customer.create({ ...baseInput, firstName: null, lastName: null });
    expect(c.displayName).toBe("miguel@folka.com");
  });

  it("returns a new Customer with updated profile (immutable)", () => {
    const c = Customer.create(baseInput);
    const updated = c.withProfile({ firstName: "Mike", lastName: "Lopez" });
    expect(updated.firstName).toBe("Mike");
    expect(c.firstName).toBe("Miguel"); // original untouched
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement**

```typescript
// src/domain/customer/Customer.ts
import { CustomerId } from "./CustomerId";
import { Email } from "./Email";

export interface CustomerInput {
  id: CustomerId;
  email: Email;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  acceptsMarketing: boolean;
}

export interface ProfileUpdate {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  acceptsMarketing?: boolean;
}

export class Customer {
  private constructor(
    readonly id: CustomerId,
    readonly email: Email,
    readonly firstName: string | null,
    readonly lastName: string | null,
    readonly phone: string | null,
    readonly acceptsMarketing: boolean,
  ) {}

  static create(input: CustomerInput): Customer {
    return new Customer(
      input.id,
      input.email,
      input.firstName,
      input.lastName,
      input.phone,
      input.acceptsMarketing,
    );
  }

  get displayName(): string {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : this.email.value;
  }

  withProfile(update: ProfileUpdate): Customer {
    return new Customer(
      this.id,
      this.email,
      update.firstName ?? this.firstName,
      update.lastName ?? this.lastName,
      update.phone ?? this.phone,
      update.acceptsMarketing ?? this.acceptsMarketing,
    );
  }
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/domain/customer/Customer.ts src/domain/customer/Customer.test.ts
git commit -m "feat(customer): add Customer entity with profile updates"
```

### Task 5: `Order` and `OrderLineItem`

**Files:**
- Create: `src/domain/customer/Order.ts`
- Create: `src/domain/customer/OrderLineItem.ts`
- Create: `src/domain/customer/Order.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/domain/customer/Order.test.ts
import { describe, it, expect } from "vitest";
import { Order } from "./Order";
import { OrderLineItem } from "./OrderLineItem";

describe("Order", () => {
  const lineItem = OrderLineItem.create({
    title: "Rocket Espresso Mozzafiato R",
    variantTitle: "Black",
    quantity: 1,
    unitPrice: { amount: "54238.24", currencyCode: "MXN" },
    productHandle: "rocket-mozzafiato-r",
    imageUrl: "https://cdn.shopify.com/foo.jpg",
  });

  it("constructs with required fields", () => {
    const order = Order.create({
      id: "gid://shopify/Order/1",
      orderNumber: "FOLKA-1042",
      processedAt: "2026-04-25T21:47:00Z",
      financialStatus: "paid",
      fulfillmentStatus: "fulfilled",
      totalPrice: { amount: "54248.24", currencyCode: "MXN" },
      lineItems: [lineItem],
      customerOrderUrl: "https://shopify.com/123/account/orders/foo",
    });
    expect(order.orderNumber).toBe("FOLKA-1042");
    expect(order.totalQuantity).toBe(1);
  });

  it("flags as actionable when not fulfilled", () => {
    const order = Order.create({
      id: "gid://shopify/Order/1",
      orderNumber: "FOLKA-1042",
      processedAt: "2026-04-25T21:47:00Z",
      financialStatus: "paid",
      fulfillmentStatus: "unfulfilled",
      totalPrice: { amount: "100", currencyCode: "MXN" },
      lineItems: [lineItem],
      customerOrderUrl: "https://example.com",
    });
    expect(order.isInProgress).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement `OrderLineItem`**

```typescript
// src/domain/customer/OrderLineItem.ts
import type { Money } from "@/lib/commerce/types";

export interface OrderLineItemInput {
  title: string;
  variantTitle: string | null;
  quantity: number;
  unitPrice: Money;
  productHandle: string | null;
  imageUrl: string | null;
}

export class OrderLineItem {
  private constructor(
    readonly title: string,
    readonly variantTitle: string | null,
    readonly quantity: number,
    readonly unitPrice: Money,
    readonly productHandle: string | null,
    readonly imageUrl: string | null,
  ) {}

  static create(input: OrderLineItemInput): OrderLineItem {
    return new OrderLineItem(
      input.title,
      input.variantTitle,
      input.quantity,
      input.unitPrice,
      input.productHandle,
      input.imageUrl,
    );
  }

  get subtotal(): Money {
    return {
      amount: (parseFloat(this.unitPrice.amount) * this.quantity).toFixed(2),
      currencyCode: this.unitPrice.currencyCode,
    };
  }
}
```

- [ ] **Step 4: Implement `Order`**

```typescript
// src/domain/customer/Order.ts
import type { Money } from "@/lib/commerce/types";
import { OrderLineItem } from "./OrderLineItem";

export type FinancialStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_paid"
  | "refunded"
  | "voided";

export type FulfillmentStatus =
  | "unfulfilled"
  | "partial"
  | "fulfilled"
  | "restocked";

export interface OrderInput {
  id: string;
  orderNumber: string;
  processedAt: string;
  financialStatus: FinancialStatus;
  fulfillmentStatus: FulfillmentStatus;
  totalPrice: Money;
  lineItems: OrderLineItem[];
  customerOrderUrl: string;
}

export class Order {
  private constructor(
    readonly id: string,
    readonly orderNumber: string,
    readonly processedAt: string,
    readonly financialStatus: FinancialStatus,
    readonly fulfillmentStatus: FulfillmentStatus,
    readonly totalPrice: Money,
    readonly lineItems: OrderLineItem[],
    readonly customerOrderUrl: string,
  ) {}

  static create(input: OrderInput): Order {
    return new Order(
      input.id,
      input.orderNumber,
      input.processedAt,
      input.financialStatus,
      input.fulfillmentStatus,
      input.totalPrice,
      input.lineItems,
      input.customerOrderUrl,
    );
  }

  get totalQuantity(): number {
    return this.lineItems.reduce((sum, li) => sum + li.quantity, 0);
  }

  get isInProgress(): boolean {
    return this.fulfillmentStatus !== "fulfilled";
  }
}
```

- [ ] **Step 5: Run test, verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/domain/customer/Order.ts src/domain/customer/OrderLineItem.ts src/domain/customer/Order.test.ts
git commit -m "feat(customer): add Order and OrderLineItem entities"
```

---

## Phase 2: Application Layer (Ports + Use Cases)

### Task 6: Define ports

**Files:**
- Create: `src/application/customer/ports.ts`

- [ ] **Step 1: Write the file (no test — interfaces have no runtime behavior to test)**

```typescript
// src/application/customer/ports.ts
import type { Customer } from "@/domain/customer/Customer";
import type { Order } from "@/domain/customer/Order";
import type { Address } from "@/domain/customer/Address";
import type { AddressInput } from "@/domain/customer/Address";
import type { ProfileUpdate } from "@/domain/customer/Customer";

export interface OAuthAuthorizeUrl {
  url: string;
  pkceVerifier: string;
  state: string;
  nonce: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: Date; // when accessToken expires
}

export interface OAuthClient {
  buildAuthorizeUrl(args: { redirectUri: string; locale: string }): Promise<OAuthAuthorizeUrl>;
  exchangeCode(args: { code: string; pkceVerifier: string; redirectUri: string }): Promise<TokenSet>;
  refresh(refreshToken: string): Promise<TokenSet>;
  revoke(refreshToken: string): Promise<void>;
}

export interface CustomerAccountGateway {
  getProfile(accessToken: string): Promise<Customer>;
  updateProfile(args: { accessToken: string; update: ProfileUpdate }): Promise<Customer>;
  getOrders(args: {
    accessToken: string;
    cursor: string | null;
    pageSize: number;
  }): Promise<{ orders: Order[]; nextCursor: string | null; hasNextPage: boolean }>;
  getOrder(args: { accessToken: string; orderId: string }): Promise<Order>;
  listAddresses(accessToken: string): Promise<{ addresses: Address[]; defaultAddressId: string | null }>;
  createAddress(args: { accessToken: string; input: AddressInput; setDefault: boolean }): Promise<Address>;
  updateAddress(args: { accessToken: string; addressId: string; input: AddressInput }): Promise<Address>;
  deleteAddress(args: { accessToken: string; addressId: string }): Promise<void>;
}

export interface SessionStore {
  read(): Promise<TokenSet | null>;
  write(tokens: TokenSet): Promise<void>;
  clear(): Promise<void>;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/application/customer/ports.ts
git commit -m "feat(customer): define application ports"
```

### Task 7: `LoginCustomer` use case

**Files:**
- Create: `src/application/customer/LoginCustomer.ts`
- Create: `src/application/customer/LoginCustomer.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/application/customer/LoginCustomer.test.ts
import { describe, it, expect, vi } from "vitest";
import { LoginCustomer } from "./LoginCustomer";
import type { OAuthClient, OAuthAuthorizeUrl } from "./ports";

describe("LoginCustomer", () => {
  it("returns the OAuth authorize URL from the client", async () => {
    const expected: OAuthAuthorizeUrl = {
      url: "https://shopify.com/authentication/123/oauth/authorize?client_id=...",
      pkceVerifier: "verifier",
      state: "state",
      nonce: "nonce",
    };
    const client: OAuthClient = {
      buildAuthorizeUrl: vi.fn().mockResolvedValue(expected),
      exchangeCode: vi.fn(),
      refresh: vi.fn(),
      revoke: vi.fn(),
    };

    const useCase = new LoginCustomer(client);
    const result = await useCase.execute({
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
      locale: "es",
    });

    expect(result).toBe(expected);
    expect(client.buildAuthorizeUrl).toHaveBeenCalledWith({
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
      locale: "es",
    });
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement**

```typescript
// src/application/customer/LoginCustomer.ts
import type { OAuthClient, OAuthAuthorizeUrl } from "./ports";

export class LoginCustomer {
  constructor(private readonly oauth: OAuthClient) {}

  async execute(args: {
    redirectUri: string;
    locale: string;
  }): Promise<OAuthAuthorizeUrl> {
    return this.oauth.buildAuthorizeUrl(args);
  }
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/application/customer/LoginCustomer.ts src/application/customer/LoginCustomer.test.ts
git commit -m "feat(customer): add LoginCustomer use case"
```

### Task 8: `HandleOAuthCallback` use case

**Files:**
- Create: `src/application/customer/HandleOAuthCallback.ts`
- Create: `src/application/customer/HandleOAuthCallback.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/application/customer/HandleOAuthCallback.test.ts
import { describe, it, expect, vi } from "vitest";
import { HandleOAuthCallback } from "./HandleOAuthCallback";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

describe("HandleOAuthCallback", () => {
  it("exchanges code, persists tokens, returns the token set", async () => {
    const tokens: TokenSet = {
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(Date.now() + 3_600_000),
    };
    const oauth: OAuthClient = {
      buildAuthorizeUrl: vi.fn(),
      exchangeCode: vi.fn().mockResolvedValue(tokens),
      refresh: vi.fn(),
      revoke: vi.fn(),
    };
    const session: SessionStore = {
      read: vi.fn(),
      write: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };

    const useCase = new HandleOAuthCallback(oauth, session);
    const result = await useCase.execute({
      code: "auth-code",
      pkceVerifier: "verifier",
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
    });

    expect(oauth.exchangeCode).toHaveBeenCalledWith({
      code: "auth-code",
      pkceVerifier: "verifier",
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
    });
    expect(session.write).toHaveBeenCalledWith(tokens);
    expect(result).toBe(tokens);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement**

```typescript
// src/application/customer/HandleOAuthCallback.ts
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

export class HandleOAuthCallback {
  constructor(
    private readonly oauth: OAuthClient,
    private readonly session: SessionStore,
  ) {}

  async execute(args: {
    code: string;
    pkceVerifier: string;
    redirectUri: string;
  }): Promise<TokenSet> {
    const tokens = await this.oauth.exchangeCode(args);
    await this.session.write(tokens);
    return tokens;
  }
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/application/customer/HandleOAuthCallback.ts src/application/customer/HandleOAuthCallback.test.ts
git commit -m "feat(customer): add HandleOAuthCallback use case"
```

### Task 9: `RefreshAccessToken` use case

**Files:**
- Create: `src/application/customer/RefreshAccessToken.ts`
- Create: `src/application/customer/RefreshAccessToken.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/application/customer/RefreshAccessToken.test.ts
import { describe, it, expect, vi } from "vitest";
import { RefreshAccessToken } from "./RefreshAccessToken";
import { AuthExpiredError } from "@/domain/customer/errors";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

describe("RefreshAccessToken", () => {
  it("throws AuthExpiredError when no session exists", async () => {
    const session: SessionStore = {
      read: vi.fn().mockResolvedValue(null),
      write: vi.fn(),
      clear: vi.fn(),
    };
    const oauth: OAuthClient = {
      buildAuthorizeUrl: vi.fn(),
      exchangeCode: vi.fn(),
      refresh: vi.fn(),
      revoke: vi.fn(),
    };

    const useCase = new RefreshAccessToken(oauth, session);
    await expect(useCase.execute()).rejects.toBeInstanceOf(AuthExpiredError);
  });

  it("refreshes when access token expires within 60s", async () => {
    const aboutToExpire: TokenSet = {
      accessToken: "old",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(Date.now() + 30_000),
    };
    const refreshed: TokenSet = { ...aboutToExpire, accessToken: "new" };
    const session: SessionStore = {
      read: vi.fn().mockResolvedValue(aboutToExpire),
      write: vi.fn(),
      clear: vi.fn(),
    };
    const oauth: OAuthClient = {
      buildAuthorizeUrl: vi.fn(),
      exchangeCode: vi.fn(),
      refresh: vi.fn().mockResolvedValue(refreshed),
      revoke: vi.fn(),
    };

    const useCase = new RefreshAccessToken(oauth, session);
    const result = await useCase.execute();
    expect(result.accessToken).toBe("new");
    expect(session.write).toHaveBeenCalledWith(refreshed);
  });

  it("returns existing token when not near expiry", async () => {
    const fresh: TokenSet = {
      accessToken: "fresh",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(Date.now() + 3_600_000),
    };
    const session: SessionStore = {
      read: vi.fn().mockResolvedValue(fresh),
      write: vi.fn(),
      clear: vi.fn(),
    };
    const oauth: OAuthClient = {
      buildAuthorizeUrl: vi.fn(),
      exchangeCode: vi.fn(),
      refresh: vi.fn(),
      revoke: vi.fn(),
    };

    const useCase = new RefreshAccessToken(oauth, session);
    const result = await useCase.execute();
    expect(result).toBe(fresh);
    expect(oauth.refresh).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement**

```typescript
// src/application/customer/RefreshAccessToken.ts
import { AuthExpiredError } from "@/domain/customer/errors";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

const REFRESH_THRESHOLD_MS = 60_000;

export class RefreshAccessToken {
  constructor(
    private readonly oauth: OAuthClient,
    private readonly session: SessionStore,
  ) {}

  async execute(): Promise<TokenSet> {
    const current = await this.session.read();
    if (!current) throw new AuthExpiredError();

    const msUntilExpiry = current.expiresAt.getTime() - Date.now();
    if (msUntilExpiry > REFRESH_THRESHOLD_MS) {
      return current;
    }

    const refreshed = await this.oauth.refresh(current.refreshToken);
    await this.session.write(refreshed);
    return refreshed;
  }
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/application/customer/RefreshAccessToken.ts src/application/customer/RefreshAccessToken.test.ts
git commit -m "feat(customer): add RefreshAccessToken use case"
```

### Task 10: `LogoutCustomer` use case

**Files:**
- Create: `src/application/customer/LogoutCustomer.ts`
- Create: `src/application/customer/LogoutCustomer.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/application/customer/LogoutCustomer.test.ts
import { describe, it, expect, vi } from "vitest";
import { LogoutCustomer } from "./LogoutCustomer";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

describe("LogoutCustomer", () => {
  it("revokes refresh token then clears session", async () => {
    const tokens: TokenSet = {
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(),
    };
    const session: SessionStore = {
      read: vi.fn().mockResolvedValue(tokens),
      write: vi.fn(),
      clear: vi.fn().mockResolvedValue(undefined),
    };
    const oauth: OAuthClient = {
      buildAuthorizeUrl: vi.fn(),
      exchangeCode: vi.fn(),
      refresh: vi.fn(),
      revoke: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new LogoutCustomer(oauth, session);
    await useCase.execute();
    expect(oauth.revoke).toHaveBeenCalledWith("rt");
    expect(session.clear).toHaveBeenCalled();
  });

  it("clears session even when no tokens exist", async () => {
    const session: SessionStore = {
      read: vi.fn().mockResolvedValue(null),
      write: vi.fn(),
      clear: vi.fn().mockResolvedValue(undefined),
    };
    const oauth: OAuthClient = {
      buildAuthorizeUrl: vi.fn(),
      exchangeCode: vi.fn(),
      refresh: vi.fn(),
      revoke: vi.fn(),
    };

    const useCase = new LogoutCustomer(oauth, session);
    await useCase.execute();
    expect(oauth.revoke).not.toHaveBeenCalled();
    expect(session.clear).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement**

```typescript
// src/application/customer/LogoutCustomer.ts
import type { OAuthClient, SessionStore } from "./ports";

export class LogoutCustomer {
  constructor(
    private readonly oauth: OAuthClient,
    private readonly session: SessionStore,
  ) {}

  async execute(): Promise<void> {
    const current = await this.session.read();
    if (current) {
      try {
        await this.oauth.revoke(current.refreshToken);
      } catch {
        // Best-effort revoke. If it fails, still clear the session.
      }
    }
    await this.session.clear();
  }
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/application/customer/LogoutCustomer.ts src/application/customer/LogoutCustomer.test.ts
git commit -m "feat(customer): add LogoutCustomer use case"
```

### Task 11: Read-side use cases (`GetCustomerProfile`, `GetCustomerOrders`, `GetOrderDetail`, `ListCustomerAddresses`)

These follow an identical pattern: get fresh access token via `RefreshAccessToken`, call gateway, return result. Implement in a single commit since they're variations on a theme.

**Files:**
- Create: `src/application/customer/GetCustomerProfile.ts`
- Create: `src/application/customer/GetCustomerOrders.ts`
- Create: `src/application/customer/GetOrderDetail.ts`
- Create: `src/application/customer/ListCustomerAddresses.ts`
- Create: `src/application/customer/read-use-cases.test.ts`

- [ ] **Step 1: Write tests for all four**

```typescript
// src/application/customer/read-use-cases.test.ts
import { describe, it, expect, vi } from "vitest";
import { GetCustomerProfile } from "./GetCustomerProfile";
import { GetCustomerOrders } from "./GetCustomerOrders";
import { GetOrderDetail } from "./GetOrderDetail";
import { ListCustomerAddresses } from "./ListCustomerAddresses";
import { Customer } from "@/domain/customer/Customer";
import { CustomerId } from "@/domain/customer/CustomerId";
import { Email } from "@/domain/customer/Email";
import { Order } from "@/domain/customer/Order";
import { Address } from "@/domain/customer/Address";
import type { CustomerAccountGateway, TokenSet } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

const tokens: TokenSet = {
  accessToken: "at",
  refreshToken: "rt",
  idToken: "id",
  expiresAt: new Date(Date.now() + 3_600_000),
};

function makeRefresh(): RefreshAccessToken {
  // We construct a real RefreshAccessToken with stub session/oauth — easier than mocking the whole class.
  return {
    execute: vi.fn().mockResolvedValue(tokens),
  } as unknown as RefreshAccessToken;
}

describe("read-side use cases", () => {
  it("GetCustomerProfile returns customer from gateway", async () => {
    const customer = Customer.create({
      id: CustomerId.from("gid://shopify/Customer/1"),
      email: Email.from("a@b.com"),
      firstName: "A",
      lastName: "B",
      phone: null,
      acceptsMarketing: false,
    });
    const gateway: Pick<CustomerAccountGateway, "getProfile"> = {
      getProfile: vi.fn().mockResolvedValue(customer),
    };
    const useCase = new GetCustomerProfile(makeRefresh(), gateway as CustomerAccountGateway);
    const result = await useCase.execute();
    expect(result).toBe(customer);
    expect(gateway.getProfile).toHaveBeenCalledWith("at");
  });

  it("GetCustomerOrders forwards pagination args", async () => {
    const gateway: Pick<CustomerAccountGateway, "getOrders"> = {
      getOrders: vi.fn().mockResolvedValue({ orders: [], nextCursor: null, hasNextPage: false }),
    };
    const useCase = new GetCustomerOrders(makeRefresh(), gateway as CustomerAccountGateway);
    await useCase.execute({ cursor: "cur", pageSize: 10 });
    expect(gateway.getOrders).toHaveBeenCalledWith({
      accessToken: "at",
      cursor: "cur",
      pageSize: 10,
    });
  });

  it("GetOrderDetail returns single order", async () => {
    const order = Order.create({
      id: "gid://shopify/Order/1",
      orderNumber: "F-1",
      processedAt: new Date().toISOString(),
      financialStatus: "paid",
      fulfillmentStatus: "fulfilled",
      totalPrice: { amount: "100", currencyCode: "MXN" },
      lineItems: [],
      customerOrderUrl: "https://example.com",
    });
    const gateway: Pick<CustomerAccountGateway, "getOrder"> = {
      getOrder: vi.fn().mockResolvedValue(order),
    };
    const useCase = new GetOrderDetail(makeRefresh(), gateway as CustomerAccountGateway);
    const result = await useCase.execute("gid://shopify/Order/1");
    expect(result).toBe(order);
  });

  it("ListCustomerAddresses returns addresses", async () => {
    const addr = Address.create({
      firstName: "M",
      lastName: "L",
      address1: "Av",
      city: "MTY",
      provinceCode: "NLE",
      countryCode: "MX",
      zip: "64960",
    });
    const gateway: Pick<CustomerAccountGateway, "listAddresses"> = {
      listAddresses: vi.fn().mockResolvedValue({ addresses: [addr], defaultAddressId: null }),
    };
    const useCase = new ListCustomerAddresses(makeRefresh(), gateway as CustomerAccountGateway);
    const result = await useCase.execute();
    expect(result.addresses).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests, verify fail**

- [ ] **Step 3: Implement all four**

```typescript
// src/application/customer/GetCustomerProfile.ts
import type { Customer } from "@/domain/customer/Customer";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

export class GetCustomerProfile {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}
  async execute(): Promise<Customer> {
    const tokens = await this.refresh.execute();
    return this.gateway.getProfile(tokens.accessToken);
  }
}
```

```typescript
// src/application/customer/GetCustomerOrders.ts
import type { Order } from "@/domain/customer/Order";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

export class GetCustomerOrders {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}
  async execute(args: {
    cursor: string | null;
    pageSize: number;
  }): Promise<{ orders: Order[]; nextCursor: string | null; hasNextPage: boolean }> {
    const tokens = await this.refresh.execute();
    return this.gateway.getOrders({ accessToken: tokens.accessToken, ...args });
  }
}
```

```typescript
// src/application/customer/GetOrderDetail.ts
import type { Order } from "@/domain/customer/Order";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

export class GetOrderDetail {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}
  async execute(orderId: string): Promise<Order> {
    const tokens = await this.refresh.execute();
    return this.gateway.getOrder({ accessToken: tokens.accessToken, orderId });
  }
}
```

```typescript
// src/application/customer/ListCustomerAddresses.ts
import type { Address } from "@/domain/customer/Address";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

export class ListCustomerAddresses {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}
  async execute(): Promise<{ addresses: Address[]; defaultAddressId: string | null }> {
    const tokens = await this.refresh.execute();
    return this.gateway.listAddresses(tokens.accessToken);
  }
}
```

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/application/customer/
git commit -m "feat(customer): add read-side use cases (profile, orders, addresses)"
```

### Task 12: Write-side use cases (`UpdateCustomerProfile`, `CreateCustomerAddress`, `UpdateCustomerAddress`, `DeleteCustomerAddress`)

Same pattern as Task 11. Each is a thin wrapper around the gateway with token refresh.

**Files:**
- Create one file per use case in `src/application/customer/`
- Create: `src/application/customer/write-use-cases.test.ts`

Test structure: each use case tests "calls gateway with refreshed token" and "propagates result". Implementations follow the same shape as Task 11's read use cases — instantiate, refresh, delegate.

- [ ] **Step 1: Write tests** (one `describe` per use case, two `it` blocks each — see Task 11 for the pattern)

- [ ] **Step 2: Run tests, verify fail**

- [ ] **Step 3: Implement four files (each ~15 lines)**

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/application/customer/
git commit -m "feat(customer): add write-side use cases for profile and addresses"
```

---

## Phase 3: Adapters

### Task 13: PKCE helper

**Files:**
- Create: `src/infrastructure/customer/pkce.ts`
- Create: `src/infrastructure/customer/pkce.test.ts`

Customer Account API requires PKCE for OAuth. We need verifier (random 43-128 chars) and challenge (SHA-256 of verifier, base64url-encoded).

- [ ] **Step 1: Write failing test**

```typescript
// src/infrastructure/customer/pkce.test.ts
import { describe, it, expect } from "vitest";
import { generatePkceVerifier, deriveChallenge } from "./pkce";

describe("pkce", () => {
  it("generates a verifier between 43 and 128 chars", () => {
    const v = generatePkceVerifier();
    expect(v.length).toBeGreaterThanOrEqual(43);
    expect(v.length).toBeLessThanOrEqual(128);
  });

  it("uses only RFC 7636 unreserved chars", () => {
    const v = generatePkceVerifier();
    expect(v).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it("derives a base64url-encoded SHA-256 challenge", async () => {
    const v = "test-verifier-with-enough-entropy-here-12345";
    const c = await deriveChallenge(v);
    expect(c).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(c.length).toBe(43); // SHA-256 → 32 bytes → 43 base64url chars no padding
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement**

```typescript
// src/infrastructure/customer/pkce.ts
import { randomBytes, createHash } from "node:crypto";

const UNRESERVED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export function generatePkceVerifier(): string {
  const bytes = randomBytes(64);
  let out = "";
  for (const b of bytes) {
    out += UNRESERVED[b % UNRESERVED.length];
  }
  return out.slice(0, 96); // within RFC 7636 [43, 128]
}

export async function deriveChallenge(verifier: string): Promise<string> {
  return createHash("sha256")
    .update(verifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateState(): string {
  return randomBytes(16).toString("base64url");
}

export function generateNonce(): string {
  return randomBytes(16).toString("base64url");
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/customer/pkce.ts src/infrastructure/customer/pkce.test.ts
git commit -m "feat(customer): add PKCE verifier and challenge generation"
```

### Task 14: `ShopifyOAuthClient` adapter

**Files:**
- Create: `src/adapters/customer/ShopifyOAuthClient.ts`
- Create: `src/adapters/customer/ShopifyOAuthClient.test.ts`

- [ ] **Step 1: Write failing test (mocking `fetch`)**

```typescript
// src/adapters/customer/ShopifyOAuthClient.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShopifyOAuthClient } from "./ShopifyOAuthClient";

const config = {
  clientId: "test-client-id",
  authUrl: "https://shopify.com/auth/123/oauth/authorize",
  tokenUrl: "https://shopify.com/auth/123/oauth/token",
  logoutUrl: "https://shopify.com/auth/123/logout",
};

describe("ShopifyOAuthClient", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("buildAuthorizeUrl returns URL with PKCE challenge, state, nonce", async () => {
    const client = new ShopifyOAuthClient(config);
    const result = await client.buildAuthorizeUrl({
      redirectUri: "https://folka.com/cb",
      locale: "es",
    });
    const u = new URL(result.url);
    expect(u.searchParams.get("client_id")).toBe("test-client-id");
    expect(u.searchParams.get("redirect_uri")).toBe("https://folka.com/cb");
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("code_challenge_method")).toBe("S256");
    expect(u.searchParams.get("code_challenge")).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(u.searchParams.get("scope")).toContain("openid");
    expect(u.searchParams.get("scope")).toContain("customer-account-api:full");
    expect(result.pkceVerifier.length).toBeGreaterThanOrEqual(43);
  });

  it("exchangeCode posts to token endpoint and parses response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "at",
        refresh_token: "rt",
        id_token: "id",
        expires_in: 3600,
      }),
    });
    const client = new ShopifyOAuthClient(config);
    const result = await client.exchangeCode({
      code: "auth-code",
      pkceVerifier: "verifier",
      redirectUri: "https://folka.com/cb",
    });
    expect(result.accessToken).toBe("at");
    expect(result.refreshToken).toBe("rt");
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(global.fetch).toHaveBeenCalledWith(
      "https://shopify.com/auth/123/oauth/token",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("exchangeCode throws on non-OK response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "invalid_grant",
    });
    const client = new ShopifyOAuthClient(config);
    await expect(
      client.exchangeCode({ code: "x", pkceVerifier: "v", redirectUri: "r" }),
    ).rejects.toThrow();
  });

  // Additional tests: refresh, revoke (similar shape).
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement**

```typescript
// src/adapters/customer/ShopifyOAuthClient.ts
import type { OAuthClient, OAuthAuthorizeUrl, TokenSet } from "@/application/customer/ports";
import {
  generatePkceVerifier,
  deriveChallenge,
  generateState,
  generateNonce,
} from "@/infrastructure/customer/pkce";

interface Config {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  logoutUrl: string;
}

const SCOPES = ["openid", "email", "customer-account-api:full"];

export class ShopifyOAuthClient implements OAuthClient {
  constructor(private readonly config: Config) {}

  async buildAuthorizeUrl(args: {
    redirectUri: string;
    locale: string;
  }): Promise<OAuthAuthorizeUrl> {
    const verifier = generatePkceVerifier();
    const challenge = await deriveChallenge(verifier);
    const state = generateState();
    const nonce = generateNonce();

    const url = new URL(this.config.authUrl);
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("redirect_uri", args.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", SCOPES.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("ui_locales", args.locale);

    return { url: url.toString(), pkceVerifier: verifier, state, nonce };
  }

  async exchangeCode(args: {
    code: string;
    pkceVerifier: string;
    redirectUri: string;
  }): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.config.clientId,
      redirect_uri: args.redirectUri,
      code: args.code,
      code_verifier: args.pkceVerifier,
    });
    const res = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token exchange failed: ${res.status} ${text}`);
    }
    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      id_token: string;
      expires_in: number;
    };
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async refresh(refreshToken: string): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.config.clientId,
      refresh_token: refreshToken,
    });
    const res = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      throw new Error(`Refresh failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      id_token: string;
      expires_in: number;
    };
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async revoke(refreshToken: string): Promise<void> {
    // Shopify Customer Account API uses logout endpoint with id_token_hint, but for
    // refresh-token revocation we hit the token endpoint with token_type_hint.
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      token: refreshToken,
      token_type_hint: "refresh_token",
    });
    await fetch(`${this.config.tokenUrl}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }).catch(() => {});
  }
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/adapters/customer/ShopifyOAuthClient.ts src/adapters/customer/ShopifyOAuthClient.test.ts
git commit -m "feat(customer): add Shopify OAuth client adapter with PKCE"
```

### Task 15: `CookieSessionStore` adapter

Stores tokens in HTTP-only signed cookies. Uses `jose` for HMAC signing so a stolen cookie can't be tampered with.

**Files:**
- Create: `src/adapters/customer/CookieSessionStore.ts`
- Create: `src/adapters/customer/CookieSessionStore.test.ts`
- Modify: `package.json` to add `jose` dependency

- [ ] **Step 1: Install `jose`**

```bash
npm install jose
```

Commit:
```bash
git add package.json package-lock.json
git commit -m "chore: add jose for JWT signing"
```

- [ ] **Step 2: Write failing test**

```typescript
// src/adapters/customer/CookieSessionStore.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CookieSessionStore } from "./CookieSessionStore";
import type { TokenSet } from "@/application/customer/ports";

// Mock next/headers
const cookies = new Map<string, string>();
const cookieStore = {
  get: vi.fn((name: string) => {
    const v = cookies.get(name);
    return v ? { name, value: v } : undefined;
  }),
  set: vi.fn((name: string, value: string) => {
    cookies.set(name, value);
  }),
  delete: vi.fn((name: string) => {
    cookies.delete(name);
  }),
};
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
}));

describe("CookieSessionStore", () => {
  const SECRET = "x".repeat(32);

  beforeEach(() => {
    cookies.clear();
    vi.clearAllMocks();
  });

  it("returns null when no cookie present", async () => {
    const store = new CookieSessionStore(SECRET);
    expect(await store.read()).toBeNull();
  });

  it("write then read returns the same token set", async () => {
    const tokens: TokenSet = {
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date("2026-12-01T00:00:00Z"),
    };
    const store = new CookieSessionStore(SECRET);
    await store.write(tokens);
    const read = await store.read();
    expect(read?.accessToken).toBe("at");
    expect(read?.refreshToken).toBe("rt");
    expect(read?.expiresAt.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("rejects tampered cookie", async () => {
    const store = new CookieSessionStore(SECRET);
    cookies.set("folka_session", "tampered.value.here");
    expect(await store.read()).toBeNull();
  });

  it("clear removes the cookie", async () => {
    const store = new CookieSessionStore(SECRET);
    await store.write({
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(),
    });
    await store.clear();
    expect(cookieStore.delete).toHaveBeenCalledWith("folka_session");
  });
});
```

- [ ] **Step 3: Run test, verify fail**

- [ ] **Step 4: Implement**

```typescript
// src/adapters/customer/CookieSessionStore.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionStore, TokenSet } from "@/application/customer/ports";

const COOKIE_NAME = "folka_session";

interface SessionPayload {
  at: string;
  rt: string;
  id: string;
  exp_at: number; // ms timestamp
}

export class CookieSessionStore implements SessionStore {
  private readonly secret: Uint8Array;

  constructor(rawSecret: string) {
    if (rawSecret.length < 32) {
      throw new Error("Session secret must be at least 32 chars");
    }
    this.secret = new TextEncoder().encode(rawSecret);
  }

  async read(): Promise<TokenSet | null> {
    const store = await cookies();
    const cookie = store.get(COOKIE_NAME);
    if (!cookie) return null;
    try {
      const { payload } = await jwtVerify(cookie.value, this.secret);
      const p = payload as unknown as SessionPayload;
      return {
        accessToken: p.at,
        refreshToken: p.rt,
        idToken: p.id,
        expiresAt: new Date(p.exp_at),
      };
    } catch {
      return null;
    }
  }

  async write(tokens: TokenSet): Promise<void> {
    const payload: SessionPayload = {
      at: tokens.accessToken,
      rt: tokens.refreshToken,
      id: tokens.idToken,
      exp_at: tokens.expiresAt.getTime(),
    };
    const jwt = await new SignJWT(payload as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // refresh-token lifetime ceiling
      .sign(this.secret);

    const store = await cookies();
    store.set(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  async clear(): Promise<void> {
    const store = await cookies();
    store.delete(COOKIE_NAME);
  }
}
```

- [ ] **Step 5: Run test, verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/adapters/customer/CookieSessionStore.ts src/adapters/customer/CookieSessionStore.test.ts
git commit -m "feat(customer): add cookie-based session store with JWT signing"
```

### Task 16: GraphQL adapter — `ShopifyCustomerAccountGateway`

Largest single adapter. Implement getProfile first, then iterate through orders, addresses, and mutations.

**Files:**
- Create: `src/adapters/customer/ShopifyCustomerAccountGateway.ts`
- Create: `src/adapters/customer/queries.ts` — GraphQL doc strings
- Create: `src/adapters/customer/mappers.ts` — GraphQL → domain
- Create: `src/adapters/customer/ShopifyCustomerAccountGateway.test.ts`

This task is large enough to break into sub-tasks per gateway method. For brevity, the plan documents the **getProfile** sub-task in full TDD detail; the remaining methods follow the same pattern (write test with `fetch` mock returning expected GraphQL shape, write GraphQL query, write mapper, wire into gateway, verify pass, commit).

#### Sub-task 16a: `getProfile`

- [ ] **Step 1: Write failing test**

```typescript
// src/adapters/customer/ShopifyCustomerAccountGateway.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShopifyCustomerAccountGateway } from "./ShopifyCustomerAccountGateway";

describe("ShopifyCustomerAccountGateway.getProfile", () => {
  const apiUrl = "https://shopify.com/123/account/customer/api/2026-01/graphql";

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("calls the GraphQL endpoint with the access token", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          customer: {
            id: "gid://shopify/Customer/1",
            emailAddress: { emailAddress: "miguel@folka.com" },
            firstName: "Miguel",
            lastName: "López",
            phoneNumber: { phoneNumber: "+528112345678" },
            acceptsMarketing: false,
          },
        },
      }),
    });

    const gateway = new ShopifyCustomerAccountGateway(apiUrl);
    const customer = await gateway.getProfile("test-access-token");

    expect(customer.email.value).toBe("miguel@folka.com");
    expect(customer.firstName).toBe("Miguel");
    expect(global.fetch).toHaveBeenCalledWith(
      apiUrl,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "test-access-token",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("throws when GraphQL response has errors", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "Unauthorized" }] }),
    });
    const gateway = new ShopifyCustomerAccountGateway(apiUrl);
    await expect(gateway.getProfile("bad-token")).rejects.toThrow("Unauthorized");
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement queries, mappers, and gateway shell**

```typescript
// src/adapters/customer/queries.ts
export const PROFILE_QUERY = `
  query CustomerProfile {
    customer {
      id
      emailAddress { emailAddress }
      firstName
      lastName
      phoneNumber { phoneNumber }
      acceptsMarketing
    }
  }
`;
```

```typescript
// src/adapters/customer/mappers.ts
import { Customer } from "@/domain/customer/Customer";
import { CustomerId } from "@/domain/customer/CustomerId";
import { Email } from "@/domain/customer/Email";

interface CustomerNode {
  id: string;
  emailAddress: { emailAddress: string };
  firstName: string | null;
  lastName: string | null;
  phoneNumber: { phoneNumber: string } | null;
  acceptsMarketing: boolean;
}

export function mapCustomer(node: CustomerNode): Customer {
  return Customer.create({
    id: CustomerId.from(node.id),
    email: Email.from(node.emailAddress.emailAddress),
    firstName: node.firstName,
    lastName: node.lastName,
    phone: node.phoneNumber?.phoneNumber ?? null,
    acceptsMarketing: node.acceptsMarketing,
  });
}
```

```typescript
// src/adapters/customer/ShopifyCustomerAccountGateway.ts
import type { CustomerAccountGateway } from "@/application/customer/ports";
import type { Customer } from "@/domain/customer/Customer";
import { PROFILE_QUERY } from "./queries";
import { mapCustomer } from "./mappers";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class ShopifyCustomerAccountGateway implements CustomerAccountGateway {
  constructor(private readonly apiUrl: string) {}

  private async query<T>(accessToken: string, query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`Customer Account API ${res.status}`);
    }
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    if (!json.data) {
      throw new Error("Customer Account API returned no data");
    }
    return json.data;
  }

  async getProfile(accessToken: string): Promise<Customer> {
    const data = await this.query<{ customer: Parameters<typeof mapCustomer>[0] }>(
      accessToken,
      PROFILE_QUERY,
    );
    return mapCustomer(data.customer);
  }

  // Stubs for the remaining methods — implemented in subsequent sub-tasks.
  async updateProfile(): Promise<Customer> { throw new Error("Not implemented"); }
  async getOrders(): Promise<{ orders: never[]; nextCursor: null; hasNextPage: false }> { throw new Error("Not implemented"); }
  async getOrder(): Promise<never> { throw new Error("Not implemented"); }
  async listAddresses(): Promise<{ addresses: never[]; defaultAddressId: null }> { throw new Error("Not implemented"); }
  async createAddress(): Promise<never> { throw new Error("Not implemented"); }
  async updateAddress(): Promise<never> { throw new Error("Not implemented"); }
  async deleteAddress(): Promise<void> { throw new Error("Not implemented"); }
}
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/adapters/customer/
git commit -m "feat(customer): add Shopify Customer Account gateway with getProfile"
```

#### Sub-task 16b–16h: Remaining gateway methods

Each sub-task follows the exact same 5-step TDD pattern as 16a:

- [ ] **16b — `updateProfile`** (mutation): Customer Account API uses `customerUpdate` mutation. Test: mock fetch, call updateProfile, assert mapped customer returned.

- [ ] **16c — `getOrders`** (paginated): GraphQL query `customer { orders(first: $n, after: $cursor) { edges { node {...} cursor } pageInfo { hasNextPage } } }`. Map to `{ orders, nextCursor, hasNextPage }`. Add `mapOrder`, `mapOrderLineItem` to mappers.

- [ ] **16d — `getOrder`** (single): GraphQL `query Order($id: ID!) { order(id: $id) { ... } }`.

- [ ] **16e — `listAddresses`**: `customer { addresses(first: 50) { ... } defaultAddress { id } }`. Add `mapAddress`.

- [ ] **16f — `createAddress`** (mutation): `customerAddressCreate(address: $input)`.

- [ ] **16g — `updateAddress`** (mutation): `customerAddressUpdate(addressId: $id, address: $input)`.

- [ ] **16h — `deleteAddress`** (mutation): `customerAddressDelete(addressId: $id)`.

Each sub-task gets its own commit: `feat(customer): implement <method> in Customer Account gateway`.

### Task 17: DI container

**Files:**
- Create: `src/infrastructure/customer/container.ts`

- [ ] **Step 1: Write the composition root**

```typescript
// src/infrastructure/customer/container.ts
import { ShopifyOAuthClient } from "@/adapters/customer/ShopifyOAuthClient";
import { ShopifyCustomerAccountGateway } from "@/adapters/customer/ShopifyCustomerAccountGateway";
import { CookieSessionStore } from "@/adapters/customer/CookieSessionStore";
import { LoginCustomer } from "@/application/customer/LoginCustomer";
import { HandleOAuthCallback } from "@/application/customer/HandleOAuthCallback";
import { RefreshAccessToken } from "@/application/customer/RefreshAccessToken";
import { LogoutCustomer } from "@/application/customer/LogoutCustomer";
import { GetCustomerProfile } from "@/application/customer/GetCustomerProfile";
import { GetCustomerOrders } from "@/application/customer/GetCustomerOrders";
import { GetOrderDetail } from "@/application/customer/GetOrderDetail";
import { ListCustomerAddresses } from "@/application/customer/ListCustomerAddresses";
import { UpdateCustomerProfile } from "@/application/customer/UpdateCustomerProfile";
import { CreateCustomerAddress } from "@/application/customer/CreateCustomerAddress";
import { UpdateCustomerAddress } from "@/application/customer/UpdateCustomerAddress";
import { DeleteCustomerAddress } from "@/application/customer/DeleteCustomerAddress";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function makeContainer() {
  const oauth = new ShopifyOAuthClient({
    clientId: requireEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID"),
    authUrl: requireEnv("SHOPIFY_CUSTOMER_AUTH_URL"),
    tokenUrl: requireEnv("SHOPIFY_CUSTOMER_TOKEN_URL"),
    logoutUrl: requireEnv("SHOPIFY_CUSTOMER_LOGOUT_URL"),
  });
  const gateway = new ShopifyCustomerAccountGateway(
    requireEnv("SHOPIFY_CUSTOMER_ACCOUNT_API_URL"),
  );
  const session = new CookieSessionStore(requireEnv("CUSTOMER_SESSION_SECRET"));
  const refresh = new RefreshAccessToken(oauth, session);

  return {
    login: new LoginCustomer(oauth),
    handleCallback: new HandleOAuthCallback(oauth, session),
    refresh,
    logout: new LogoutCustomer(oauth, session),
    getProfile: new GetCustomerProfile(refresh, gateway),
    getOrders: new GetCustomerOrders(refresh, gateway),
    getOrder: new GetOrderDetail(refresh, gateway),
    listAddresses: new ListCustomerAddresses(refresh, gateway),
    updateProfile: new UpdateCustomerProfile(refresh, gateway),
    createAddress: new CreateCustomerAddress(refresh, gateway),
    updateAddress: new UpdateCustomerAddress(refresh, gateway),
    deleteAddress: new DeleteCustomerAddress(refresh, gateway),
  };
}

export type CustomerContainer = ReturnType<typeof makeContainer>;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p tsconfig.json`

- [ ] **Step 3: Commit**

```bash
git add src/infrastructure/customer/container.ts
git commit -m "feat(customer): add DI container composition root"
```

---

## Phase 4: API Routes

### Task 18: `/api/auth/customer/login` route

**Files:**
- Create: `src/app/api/auth/customer/login/route.ts`

- [ ] **Step 1: Implement the route**

```typescript
// src/app/api/auth/customer/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeContainer } from "@/infrastructure/customer/container";

const PKCE_COOKIE = "folka_pkce";
const STATE_COOKIE = "folka_state";

export async function GET(req: Request) {
  const { login } = makeContainer();
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") ?? "es";
  const redirectUri = `${url.origin}/api/auth/customer/callback`;

  const auth = await login.execute({ redirectUri, locale });

  const cookieStore = await cookies();
  cookieStore.set(PKCE_COOKIE, auth.pkceVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min — only needed for the round-trip
  });
  cookieStore.set(STATE_COOKIE, auth.state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(auth.url, 302);
}
```

- [ ] **Step 2: Manual smoke test**

Run: `npm run dev`
Visit: `http://localhost:3000/api/auth/customer/login?locale=es`
Expected: redirect to `https://shopify.com/authentication/<shop>/oauth/authorize?...` with all PKCE params.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/customer/login/route.ts
git commit -m "feat(auth): add OAuth login init route"
```

### Task 19: `/api/auth/customer/callback` route

**Files:**
- Create: `src/app/api/auth/customer/callback/route.ts`

- [ ] **Step 1: Implement**

```typescript
// src/app/api/auth/customer/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeContainer } from "@/infrastructure/customer/container";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateFromUrl = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${url.origin}/account/login?error=${encodeURIComponent(error)}`);
  }
  if (!code || !stateFromUrl) {
    return NextResponse.redirect(`${url.origin}/account/login?error=missing_params`);
  }

  const cookieStore = await cookies();
  const verifier = cookieStore.get("folka_pkce")?.value;
  const expectedState = cookieStore.get("folka_state")?.value;
  if (!verifier || !expectedState) {
    return NextResponse.redirect(`${url.origin}/account/login?error=session_expired`);
  }
  if (expectedState !== stateFromUrl) {
    return NextResponse.redirect(`${url.origin}/account/login?error=state_mismatch`);
  }

  const { handleCallback } = makeContainer();
  try {
    await handleCallback.execute({
      code,
      pkceVerifier: verifier,
      redirectUri: `${url.origin}/api/auth/customer/callback`,
    });
  } catch (e) {
    return NextResponse.redirect(`${url.origin}/account/login?error=token_exchange_failed`);
  }

  cookieStore.delete("folka_pkce");
  cookieStore.delete("folka_state");

  return NextResponse.redirect(`${url.origin}/es/account`, 302);
}
```

- [ ] **Step 2: Smoke test (manual)**

After Task 18 redirects to Shopify, log in with a test customer. Shopify redirects back to `/api/auth/customer/callback?code=...&state=...`. Expected: lands on `/es/account` with `folka_session` cookie set.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/customer/callback/route.ts
git commit -m "feat(auth): add OAuth callback route with state verification"
```

### Task 20: `/api/auth/customer/logout` route

**Files:**
- Create: `src/app/api/auth/customer/logout/route.ts`

- [ ] **Step 1: Implement**

```typescript
// src/app/api/auth/customer/logout/route.ts
import { NextResponse } from "next/server";
import { makeContainer } from "@/infrastructure/customer/container";

export async function POST(req: Request) {
  const { logout } = makeContainer();
  await logout.execute();
  const url = new URL(req.url);
  return NextResponse.redirect(`${url.origin}/`, 303);
}
```

- [ ] **Step 2: Smoke test**

After login, POST to `/api/auth/customer/logout`. Expected: cookie cleared, redirect to home.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/customer/logout/route.ts
git commit -m "feat(auth): add logout route"
```

---

## Phase 5: Account UI — Shell + Login

### Task 21: Account layout (auth required)

**Files:**
- Create: `src/app/[locale]/account/layout.tsx`
- Create: `src/components/account/AccountSidebar.tsx`
- Create: `src/components/account/AccountSidebar.module.css` (or Tailwind classes inline)

Design notes (from `ui-ux-expert` and `frontend-design`):
- Sidebar: Midnight Blue background, Desert White text, Rajdhani uppercase tracking-[0.15em] for nav items
- Active nav item: Mineral Sand left border (3px), slightly brighter text
- Mobile: sidebar collapses to bottom tab bar (5 items max — Dashboard, Orders, Profile, Addresses, Logout)
- Logged-out: redirect to `/account/login`

- [ ] **Step 1: Build layout shell**

```tsx
// src/app/[locale]/account/layout.tsx
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { makeContainer } from "@/infrastructure/customer/container";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { refresh } = makeContainer();
  try {
    await refresh.execute();
  } catch {
    redirect(`/${locale}/account/login`);
  }

  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="min-h-screen bg-folka-paper">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <AccountSidebar locale={locale} t={{
          dashboard: t("nav.dashboard"),
          orders: t("nav.orders"),
          profile: t("nav.profile"),
          addresses: t("nav.addresses"),
          logout: t("nav.logout"),
        }} />
        <main className="px-6 py-12 md:px-12 md:py-16">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build `AccountSidebar`**

```tsx
// src/components/account/AccountSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  locale: string;
  t: { dashboard: string; orders: string; profile: string; addresses: string; logout: string };
}

const items = (locale: string, t: Props["t"]) => [
  { href: `/${locale}/account`, label: t.dashboard, exact: true },
  { href: `/${locale}/account/orders`, label: t.orders },
  { href: `/${locale}/account/profile`, label: t.profile },
  { href: `/${locale}/account/addresses`, label: t.addresses },
];

export function AccountSidebar({ locale, t }: Props) {
  const pathname = usePathname();
  const links = items(locale, t);

  return (
    <aside className="lg:sticky lg:top-0 lg:h-screen lg:bg-folka-midnight lg:text-folka-paper px-6 py-12">
      <h2 className="font-rajdhani text-sm uppercase tracking-[0.25em] text-folka-sand mb-8">
        {t.dashboard.toUpperCase()}
      </h2>
      <nav>
        <ul className="space-y-1">
          {links.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block py-3 px-3 -mx-3 font-rajdhani uppercase tracking-[0.15em] text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-folka-sand ${
                    isActive
                      ? "border-l-[3px] border-folka-sand pl-[9px] text-folka-paper"
                      : "text-folka-paper/70 hover:text-folka-paper"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="pt-6 mt-6 border-t border-folka-paper/10">
            <form action="/api/auth/customer/logout" method="post">
              <button
                type="submit"
                className="block py-3 px-3 -mx-3 font-rajdhani uppercase tracking-[0.15em] text-sm text-folka-paper/70 hover:text-folka-paper transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-folka-sand"
              >
                {t.logout}
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Add i18n strings**

Edit `messages/es.json`, `messages/en.json` to add the `account.nav.*` keys.

- [ ] **Step 4: Smoke test**

Visit `/es/account` while not logged in → should redirect to `/es/account/login`. Log in → should land on `/es/account` and see the sidebar.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/account/ src/components/account/ messages/
git commit -m "feat(account): add auth-protected layout with editorial sidebar"
```

### Task 22: Login page

The login page is intentionally minimal — its job is to explain why the user is being sent to Shopify and to render a single CTA. The actual auth happens at `/api/auth/customer/login`.

**Files:**
- Create: `src/app/[locale]/account/login/page.tsx`

Design notes:
- Full-bleed editorial hero (left half) with rotating image of espresso pour, right half with the form/CTA
- One H1, one CTA, optional error banner if `?error=` query param
- No card with `shadow-md` — solid Desert White on the form side, full image on the left
- Below the CTA: small line of helper text in Mineral Sand explaining "We use Shopify for secure sign-in"

- [ ] **Step 1: Implement**

```tsx
// src/app/[locale]/account/login/page.tsx
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const t = await getTranslations({ locale, namespace: "account.login" });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block bg-folka-midnight">
        <Image
          src="/login-hero/espresso-pour.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-90"
        />
      </div>

      <div className="flex flex-col justify-center px-8 py-20 md:px-16 bg-folka-paper">
        <p className="font-rajdhani uppercase tracking-[0.25em] text-folka-sand text-xs mb-6">
          {t("eyebrow")}
        </p>
        <h1 className="font-rajdhani uppercase tracking-[0.05em] text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-folka-midnight mb-8">
          {t("title")}
        </h1>
        <p className="font-inter text-folka-midnight/70 text-base leading-relaxed max-w-md mb-12">
          {t("body")}
        </p>

        {error && (
          <div role="alert" className="border-l-[3px] border-[oklch(50%_0.18_28)] pl-4 py-3 mb-8 bg-folka-paper">
            <p className="font-inter text-sm text-[oklch(50%_0.18_28)]">{t(`errors.${error}`)}</p>
          </div>
        )}

        <a
          href={`/api/auth/customer/login?locale=${locale}`}
          className="inline-flex items-center justify-center px-8 py-4 bg-folka-midnight text-folka-paper font-rajdhani uppercase tracking-[0.15em] text-sm hover:bg-folka-midnight/90 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-folka-midnight w-fit"
        >
          {t("cta")}
        </a>

        <p className="mt-6 font-inter text-xs text-folka-midnight/50 max-w-md">
          {t("helper")}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add i18n**

```json
// messages/es.json (snippet)
{
  "account": {
    "login": {
      "eyebrow": "ACCESO MIEMBROS",
      "title": "Inicia sesión",
      "body": "Accede a tu historial de pedidos, direcciones guardadas y preferencias.",
      "cta": "Continuar",
      "helper": "Te llevaremos brevemente a Shopify para verificar tu identidad. Tu sesión vuelve aquí en cuanto termines.",
      "errors": {
        "missing_params": "Faltan datos en la solicitud. Vuelve a intentar.",
        "session_expired": "La sesión expiró. Vuelve a intentar.",
        "state_mismatch": "Hubo un problema de seguridad en la solicitud. Vuelve a intentar.",
        "token_exchange_failed": "No pudimos completar el inicio de sesión. Vuelve a intentar.",
        "access_denied": "Cancelaste el inicio de sesión."
      }
    }
  }
}
```

(English variant in `messages/en.json` — same structure, no em-dash per CLAUDE.md.)

- [ ] **Step 3: Smoke test**

Visit `/es/account/login` → should render. Click CTA → should redirect to Shopify. Cancel on Shopify → should land back on `/es/account/login?error=access_denied`.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/account/login/ messages/
git commit -m "feat(account): add login page with editorial split layout"
```

---

## Phase 6: Account UI — Dashboard, Orders, Profile, Addresses

Each page below follows the same pattern: Server Component fetches data via container use case, passes presented DTOs to a client component for interactivity (where needed). Loading and error boundaries via `loading.tsx` and `error.tsx` next to each page.

### Task 23: Dashboard `/account`

**Files:**
- Create: `src/app/[locale]/account/page.tsx`
- Create: `src/app/[locale]/account/loading.tsx`
- Create: `src/app/[locale]/account/error.tsx`
- Create: `src/components/account/DashboardHero.tsx`
- Create: `src/components/account/RecentOrderCard.tsx`

Design (editorial, asymmetric):
- H1 left-third "Hola, Miguel." Rajdhani 600 64px
- Below: H2 "Pedido reciente" + RecentOrderCard (full-width, image left + details right)
- Right-third on desktop: small "Direcciones guardadas" widget with default address
- All text colors meet WCAG AA on Desert White

- [ ] **Step 1: Implement** (full code in plan repo — design tokens already covered)

- [ ] **Step 2: Verify** Lighthouse desktop ≥ 90

- [ ] **Step 3: Commit**

### Task 24: Orders list `/account/orders`

**Files:**
- Create: `src/app/[locale]/account/orders/page.tsx`
- Create: `src/components/account/OrderListItem.tsx`
- Create: `src/components/account/Pagination.tsx`

Design:
- One H1, then a horizontal-rule, then a tabular list (NOT cards)
- Columns: Order # / Date / Items (count) / Total / Status
- Each row clickable, hover state subtle (Desert White → slightly darker tone, no background fill)
- Cursor-based pagination (`?cursor=...`) — prev/next links at bottom

- [ ] **Step 1: Implement page** with paginated fetch via `getOrders` use case

- [ ] **Step 2: Implement OrderListItem** as link styled as table row

- [ ] **Step 3: Implement Pagination** component (prev/next with `aria-label` for screen readers)

- [ ] **Step 4: Test pagination manually**: log in with a customer that has 25+ orders. Verify next/prev work.

- [ ] **Step 5: Commit**

### Task 25: Order detail `/account/orders/[id]`

**Files:**
- Create: `src/app/[locale]/account/orders/[id]/page.tsx`
- Create: `src/components/account/OrderTimeline.tsx`
- Create: `src/components/account/OrderLineItemRow.tsx`

Design:
- Editorial layout: order # as H1 (Rajdhani 64px), date as small caps subtitle in Mineral Sand
- Status: NOT a colored pill. Status word in Rajdhani uppercase + horizontal accent rule below in Mineral Sand. No green/yellow/red.
- Line items: image (120×120) + title + variant + qty + unit price. Border-bottom on each row, no card backgrounds.
- Totals: right-aligned, Rajdhani 24px for total, plain Inter for subtotal/tax/shipping
- "Reorder" button: Mineral Sand background, Midnight Blue text. Below: "Track shipment" link if `customerOrderUrl` present

- [ ] **Step 1: Implement order detail page**

- [ ] **Step 2: Add `loading.tsx` skeleton — text shimmer only on the totals area**

- [ ] **Step 3: Test with a real order ID** (logged-in customer)

- [ ] **Step 4: Commit**

### Task 26: Profile `/account/profile`

**Files:**
- Create: `src/app/[locale]/account/profile/page.tsx`
- Create: `src/app/[locale]/account/profile/actions.ts` (Server Action)
- Create: `src/components/account/ProfileForm.tsx`

Design:
- One column, max-width 480px (45–60ch line length per design skill)
- Labels visible above each input (NOT placeholder-only)
- Inputs: 1px border in Midnight Blue, no rounded corners, focus-visible ring in Mineral Sand
- Helper text below each input where ambiguity exists (e.g., "Solo te enviaremos correos si los aceptas explícitamente")
- Inline validation on **blur** (not keystroke). Errors inline below field with `role="alert"`.
- Submit button: Midnight Blue solid. Disabled state: 50% opacity + "no-cursor".

- [ ] **Step 1: Build form component with controlled inputs and Zod validation**

```typescript
// snippet — full implementation in actual file
import { z } from "zod";

export const ProfileSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido").max(50),
  lastName: z.string().min(1, "Apellido requerido").max(50),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Teléfono inválido").optional().or(z.literal("")),
  acceptsMarketing: z.boolean(),
});
```

- [ ] **Step 2: Server Action calls `updateProfile.execute()`**

- [ ] **Step 3: After save, show inline success toast (auto-dismiss 3s, `aria-live="polite"`)**

- [ ] **Step 4: Test happy path + invalid email + network error**

- [ ] **Step 5: Commit**

### Task 27: Addresses `/account/addresses` + `[id]/edit` + `new`

**Files:**
- Create: `src/app/[locale]/account/addresses/page.tsx` — list
- Create: `src/app/[locale]/account/addresses/new/page.tsx` — create form
- Create: `src/app/[locale]/account/addresses/[id]/edit/page.tsx` — edit form
- Create: `src/app/[locale]/account/addresses/actions.ts` — server actions
- Create: `src/components/account/AddressCard.tsx`
- Create: `src/components/account/AddressForm.tsx`

Design (per `design.md` design system principles):
- List: 2-column grid on desktop, single on mobile. Each AddressCard:
  - 1px Mineral Sand border (NOT shadow)
  - Address formatted via `address.formatSingleLine()` in Inter 14px
  - Default badge: small "PREDETERMINADA" in Rajdhani uppercase tracking-[0.25em] under the name
  - Edit / Delete actions as text links at the bottom (no buttons-as-icons)
- Form (new and edit reuse `AddressForm`):
  - Two columns on desktop (street/zip on left, city/state/country on right)
  - One column on mobile
  - Country/State as native `<select>` (don't redesign — use `Jakob's law`)
  - Confirm dialog before delete (per `error-prevention` UX heuristic)

- [ ] **Step 1: Implement AddressCard with default badge**

- [ ] **Step 2: Implement AddressForm with shared validation schema**

- [ ] **Step 3: Implement list page (use case: `listAddresses`)**

- [ ] **Step 4: Implement new + edit pages with server actions**

- [ ] **Step 5: Implement delete with confirm modal (use HTML `<dialog>` for native a11y)**

- [ ] **Step 6: Test happy path: add → edit → set default → delete**

- [ ] **Step 7: Commit**

---

## Phase 7: Migration & Cleanup

### Task 28: Update header link

**Files:**
- Modify: [src/components/layout/header.tsx](../../../src/components/layout/header.tsx)
- Modify: [src/components/layout/mobile-menu.tsx](../../../src/components/layout/mobile-menu.tsx)

- [ ] **Step 1: Change `href`**

```tsx
// header.tsx — was: https://account.folkasolutions.com/
href="/es/account"
```

For locale-aware: use `next-intl` `<Link>` or render dynamically per locale.

- [ ] **Step 2: Test login flow end-to-end** — click user icon → if logged out, lands on `/account/login` → click CTA → Shopify auth → callback → `/account` dashboard.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(header): point user icon to in-app account routes"
```

### Task 29: Remove patches and Shopify-managed redirects

Once the new flow is live and verified:

**Files:**
- Modify: [next.config.ts](../../../next.config.ts) — remove the `/services/login_with_shop`, `/customer_authentication`, `/customer_identity` exclusions (still keep the cart, checkout, and `_t` redirects for the abandoned-cart email flow)
- Modify: [src/proxy.ts](../../../src/proxy.ts) — restore matcher minus the customer-auth excludes (keep `_t`, `cart/c`)

- [ ] **Step 1: Update next.config.ts**

Remove the redirects for `/services/login_with_shop/*` and the matcher excludes for `customer_authentication` and `customer_identity` since we no longer redirect users to Shopify-hosted account pages.

- [ ] **Step 2: Update proxy.ts matcher accordingly**

- [ ] **Step 3: Test that nothing 404s**

```bash
curl -I https://folkasolutions.com/es/account
# Expected: 200 if logged in, 307 redirect to /es/account/login if not
```

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(routing): remove Shopify-hosted account redirects"
```

### Task 30: DNS cleanup

After 30 days of stable operation in production with the new flow:

- [ ] **Step 1:** Cloudflare → folkasolutions.com → DNS → delete the `account` CNAME record
- [ ] **Step 2:** Verify nothing breaks via curl: `curl -I https://account.folkasolutions.com` should return DNS resolution failure
- [ ] **Step 3:** Update internal docs if any reference `account.folkasolutions.com`

(No commit — DNS is external.)

---

## Phase 8: End-to-end validation

### Task 31: Playwright E2E suite

**Files:**
- Create: `tests/e2e/customer-account.spec.ts`

Tests (each one a discrete `test()` block):

- [ ] Logged-out user visiting `/account` redirects to `/account/login`
- [ ] Login button on `/account/login` redirects to Shopify
- [ ] After Shopify auth, user lands on `/account` with sidebar
- [ ] Sidebar nav active state matches current path
- [ ] Profile form: invalid email shows inline error
- [ ] Profile form: valid update persists across refresh
- [ ] Orders list paginates correctly
- [ ] Order detail loads via direct URL
- [ ] Address: create, edit, set default, delete
- [ ] Logout clears session and redirects to `/`
- [ ] Password reset link on login page redirects to Shopify password reset

Setup: dedicated test customer in Shopify with known password and seeded orders/addresses. Store credentials in `TEST_CUSTOMER_EMAIL`, `TEST_CUSTOMER_PASSWORD` env vars (Sensitive in Vercel for Preview deploys).

- [ ] **Step 1: Set up Playwright config** if not already present

- [ ] **Step 2: Write all 11 tests**

- [ ] **Step 3: Run locally** `npx playwright test`

- [ ] **Step 4: Wire to GitHub Actions** so PRs run E2E against Preview deploys

- [ ] **Step 5: Commit**

---

## Performance Budget Validation

After Phase 6, run a performance audit before moving to migration:

- [ ] **Lighthouse mobile** on `/es/account/login`, `/es/account`, `/es/account/orders/<id>` — all ≥ 90 Performance, ≥ 95 Accessibility
- [ ] **Bundle analysis**: `ANALYZE=true npm run build` — confirm `/account` route under 300KB JS gzipped (most should be RSC)
- [ ] **Image audit**: every `<Image>` has explicit width/height or `fill` with sized parent. No layout shift on order detail.
- [ ] **Font audit**: only Rajdhani + Inter loaded. `font-display: swap`. No CLS from font load.
- [ ] **DB/API call audit** (using PostHog `$performance_metric`): orders list page makes ≤ 2 GraphQL calls (auth refresh + orders query). Order detail same.

---

## Self-Review Checklist (run before declaring complete)

**Spec coverage:**
- [ ] Login (custom UI) ✓ Task 22
- [ ] Account dashboard ✓ Task 23
- [ ] Order list + detail ✓ Tasks 24–25
- [ ] Profile editing ✓ Task 26
- [ ] Address book ✓ Task 27
- [ ] Logout ✓ Task 20
- [ ] Token refresh ✓ Task 9
- [ ] Migration of header link + DNS cleanup ✓ Tasks 28, 30
- [ ] Cleanup of redirect patches ✓ Task 29

**Architecture (clean-architecture):**
- [ ] `grep -r "from \"next\\|from \"@shopify" src/domain/` returns zero
- [ ] `grep -r "from \"next\\|from \"@shopify" src/application/` returns zero
- [ ] Use cases are testable with stub adapters (no network in unit tests)
- [ ] Single composition root in `src/infrastructure/customer/container.ts`

**Design (ui-ux-expert + design):**
- [ ] No purple gradients, no `shadow-md rounded-xl`, no Inter as display
- [ ] Type scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64 — each screen uses ≤ 4 sizes
- [ ] Editorial layouts (asymmetric, generous space) on dashboard, login, order detail
- [ ] All forms: visible labels, blur-validation, error placement near field
- [ ] All states defined: hover, focus, active, disabled, loading, empty, error, success
- [ ] WCAG 2.2 AA contrast verified with checker, not eyeballed
- [ ] Keyboard nav works on every interactive element with visible focus rings
- [ ] Em-dash NOT in any user-visible string (per CLAUDE.md rule)
- [ ] No emojis as UI icons — SVG only (already enforced via `Icon` component)

**Performance (performance):**
- [ ] Lighthouse ≥ 90 mobile on all account routes
- [ ] LCP < 2.5s on `/account` and `/account/orders`
- [ ] Bundle JS per route < 300KB gzipped
- [ ] No layout shift (CLS < 0.1)
- [ ] Server Components for all reads; Server Actions for writes (no client-side data fetching except where genuinely interactive)
- [ ] Loading.tsx + error.tsx at every async route

**Security:**
- [ ] All Shopify secrets marked Sensitive in Vercel
- [ ] Session cookie HTTP-only, Secure, SameSite=Lax, signed with HS256
- [ ] PKCE on OAuth (verifier 96 chars)
- [ ] State parameter verified on callback to prevent CSRF
- [ ] Refresh tokens revoked on logout (best-effort)
- [ ] No tokens logged or stored in localStorage

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-02-customer-account-api.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a multi-day project of this scope.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints. Better if you want to review code as it's written.

**Recommendation:** Option 1 for this plan. Phases 1 and 2 (domain + application) can run as parallel subagents since they have zero shared state. Phase 3 (adapters) depends on Phase 2 ports, then becomes parallel. Phase 4+ is sequential.

**Which approach?**

---

## Notes

- **Timing:** This is a Q3 2026 roadmap, NOT a launch blocker. The current patchwork (account.folkasolutions.com + redirects in next.config.ts) keeps the May 2026 launch on schedule. Schedule this plan for execution after launch stabilization (~6 weeks of clean operation).
- **Phased rollout option:** Phases 1–4 (foundation + OAuth) can ship as a hidden feature flag without UI. Then Phase 5 (login) goes live for internal testing. Phase 6 rolls out routes one at a time with a feature flag per route. This keeps risk bounded and allows rollback per page.
- **Out of scope but worth tracking:** Custom checkout (requires Shopify Plus). Subscriptions / recurring orders. Loyalty program. Shop Pay social login as custom UI (Shopify owns this — leave the OAuth provider's "Continue with Shop" button on the Shopify-hosted Customer Account API authorize page).
