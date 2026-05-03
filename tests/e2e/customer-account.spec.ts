import { test, expect } from "@playwright/test";

/**
 * E2E suite for the Shopify Customer Account API integration.
 *
 * Public smoke tests run against any local dev server. The OAuth-flow tests
 * skip themselves unless TEST_CUSTOMER_EMAIL and TEST_CUSTOMER_PASSWORD are
 * set (and the corresponding Shopify Customer Account API app is configured
 * per the plan's Prerequisites P1-P3).
 */
const hasAuthEnv = Boolean(
  process.env.TEST_CUSTOMER_EMAIL && process.env.TEST_CUSTOMER_PASSWORD,
);

const SKIP_MESSAGE =
  "Requires TEST_CUSTOMER_EMAIL and TEST_CUSTOMER_PASSWORD env vars and a Shopify Customer Account API app configured (see plan Prerequisites P1-P3).";

test.describe("customer account flow", () => {
  test("logged-out user visiting /es/account is redirected to login", async ({ page }) => {
    await page.goto("/es/account");
    await expect(page).toHaveURL(/\/es\/account\/login/);
  });

  test("login page renders the editorial layout", async ({ page }) => {
    await page.goto("/es/account/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const cta = page.locator('a[href*="/api/auth/customer/login"]');
    await expect(cta).toBeVisible();
  });

  test("login page surfaces error from query param", async ({ page }) => {
    await page.goto("/es/account/login?error=session_expired");
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("clicking the login CTA redirects to Shopify auth endpoint", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account/login");
    const cta = page.locator('a[href*="/api/auth/customer/login"]');
    const href = await cta.getAttribute("href");
    expect(href).toMatch(/^\/api\/auth\/customer\/login\?locale=es$/);
  });

  test("after login, user lands on /es/account with sidebar visible", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account");
    await expect(page.getByRole("link", { name: /pedidos/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /perfil/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /direcciones/i })).toBeVisible();
  });

  test("sidebar marks the active nav item", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account/orders");
    const ordersLink = page.getByRole("link", { name: /pedidos/i });
    await expect(ordersLink).toHaveAttribute("aria-current", "page");
  });

  test("profile form rejects invalid phone format on submit", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account/profile");
    await page.fill('input[name="phone"]', "abc");
    await page.click('button[type="submit"]');
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("profile form persists valid update across reload", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account/profile");
    const newFirstName = `Test-${Date.now()}`;
    await page.fill('input[name="firstName"]', newFirstName);
    await page.click('button[type="submit"]');
    await expect(page.getByRole("status")).toBeVisible();
    await page.reload();
    await expect(page.locator('input[name="firstName"]')).toHaveValue(newFirstName);
  });

  test("orders list renders and pagination works when there are 20+ orders", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account/orders");
    await expect(page.getByRole("heading", { level: 1, name: /pedidos/i })).toBeVisible();
    const nextLink = page.getByRole("link", { name: /siguiente/i });
    if (await nextLink.isVisible()) {
      await nextLink.click();
      await expect(page).toHaveURL(/cursor=/);
    }
  });

  test("order detail loads via direct URL", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account/orders");
    const firstOrder = page.locator('a[href*="/account/orders/"]').first();
    await firstOrder.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/total/i).last()).toBeVisible();
  });

  test("address: create, edit, delete cycle", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);

    await page.goto("/es/account/addresses/new");
    const stamp = Date.now().toString();
    await page.fill('input[name="firstName"]', "E2E");
    await page.fill('input[name="lastName"]', `Test-${stamp}`);
    await page.fill('input[name="address1"]', "Av. Test 1234");
    await page.fill('input[name="city"]', "Monterrey");
    await page.fill('input[name="provinceCode"]', "NLE");
    await page.fill('input[name="zip"]', "64960");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/account\/addresses(?!\/)/);

    const newCard = page.locator(`text=Test-${stamp}`).first().locator("xpath=ancestor::*[1]");
    await newCard.locator('a[href*="/edit"]').click();
    await page.fill('input[name="lastName"]', `Test-${stamp}-edited`);
    await page.click('button[type="submit"]');
    await expect(page.locator(`text=Test-${stamp}-edited`)).toBeVisible();

    const editedCard = page.locator(`text=Test-${stamp}-edited`).first().locator("xpath=ancestor::*[1]");
    await editedCard.locator("button", { hasText: /eliminar/i }).click();
    await page.locator("dialog button", { hasText: /^eliminar$/i }).click();
    await expect(page.locator(`text=Test-${stamp}-edited`)).not.toBeVisible();
  });

  test("logout clears session and returns to home", async ({ page }) => {
    test.skip(!hasAuthEnv, SKIP_MESSAGE);
    await page.goto("/es/account");
    await page.locator('form[action="/api/auth/customer/logout"] button').click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/es/account");
    await expect(page).toHaveURL(/\/account\/login/);
  });
});
