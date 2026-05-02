# Customer Account E2E

Playwright suite for the `/account` flow.

## Public smoke tests (no setup needed)

These run against a fresh dev server and don't require Shopify config:

- Logged-out user redirected to /account/login
- Login page renders
- Login page error banner shows when ?error= present

Run:

```bash
npx playwright install chromium # one-time
npm run test:e2e
```

## Authenticated tests

Most tests require:

1. Shopify Customer Account API app configured (see plan Prerequisites P1-P3)
2. A test customer in Shopify with a known password and seeded orders/addresses
3. `.env.test.local` (or shell exports) with:
   - `TEST_CUSTOMER_EMAIL`
   - `TEST_CUSTOMER_PASSWORD`
   - All `SHOPIFY_CUSTOMER_*` env vars

When those are set, the suite runs the full flow against the real Shopify endpoints.

When the env is missing, the auth-required tests skip with a clear message so the public tests still pass in CI.
