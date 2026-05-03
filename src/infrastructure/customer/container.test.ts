import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { makeContainer } from "./container";

const REQUIRED_ENV = [
  "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID",
  "SHOPIFY_CUSTOMER_ACCOUNT_API_URL",
  "SHOPIFY_CUSTOMER_AUTH_URL",
  "SHOPIFY_CUSTOMER_TOKEN_URL",
  "SHOPIFY_CUSTOMER_LOGOUT_URL",
  "CUSTOMER_SESSION_SECRET",
];

describe("makeContainer", () => {
  let savedEnv: Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = {};
    for (const name of REQUIRED_ENV) {
      savedEnv[name] = process.env[name];
    }
  });

  afterEach(() => {
    for (const name of REQUIRED_ENV) {
      if (savedEnv[name] === undefined) delete process.env[name];
      else process.env[name] = savedEnv[name];
    }
  });

  function setAll() {
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID = "client-id";
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL =
      "https://shopify.com/123/account/customer/api/2026-01/graphql";
    process.env.SHOPIFY_CUSTOMER_AUTH_URL =
      "https://shopify.com/auth/123/oauth/authorize";
    process.env.SHOPIFY_CUSTOMER_TOKEN_URL =
      "https://shopify.com/auth/123/oauth/token";
    process.env.SHOPIFY_CUSTOMER_LOGOUT_URL =
      "https://shopify.com/auth/123/logout";
    process.env.CUSTOMER_SESSION_SECRET = "x".repeat(32);
  }

  it("constructs all use cases when env is complete", () => {
    setAll();
    const c = makeContainer();
    expect(c.login).toBeDefined();
    expect(c.handleCallback).toBeDefined();
    expect(c.refresh).toBeDefined();
    expect(c.logout).toBeDefined();
    expect(c.getProfile).toBeDefined();
    expect(c.getOrders).toBeDefined();
    expect(c.getOrder).toBeDefined();
    expect(c.listAddresses).toBeDefined();
    expect(c.updateProfile).toBeDefined();
    expect(c.createAddress).toBeDefined();
    expect(c.updateAddress).toBeDefined();
    expect(c.deleteAddress).toBeDefined();
  });

  for (const missing of REQUIRED_ENV) {
    it(`throws when ${missing} is missing`, () => {
      setAll();
      delete process.env[missing];
      expect(() => makeContainer()).toThrow(`Missing env var: ${missing}`);
    });
  }
});
