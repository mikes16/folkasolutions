import { afterEach, describe, expect, it } from "vitest";
import type { Cart } from "./types";
import { getCartTotalsView } from "./cart-totals";

function buildCart(overrides: Partial<Cart["cost"]> = {}): Cart {
  return {
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://example.com/checkout",
    totalQuantity: 1,
    buyerIdentity: { countryCode: "MX" },
    lines: [],
    cost: {
      subtotalAmount: { amount: "1000.00", currencyCode: "MXN" },
      totalAmount: { amount: "1000.00", currencyCode: "MXN" },
      totalTaxAmount: null,
      ...overrides,
    },
  };
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_TAX_MODE;
});

describe("getCartTotalsView", () => {
  it("estimates 16% IVA for Mexico when Shopify has not computed tax yet", () => {
    const view = getCartTotalsView(buildCart(), "MX");
    expect(view.taxLine).toEqual({
      amount: { amount: "160.00", currencyCode: "MXN" },
      isEstimate: true,
    });
    expect(view.total).toEqual({ amount: "1160.00", currencyCode: "MXN" });
    expect(view.totalIsEstimate).toBe(true);
  });

  it("prefers the real tax amount from Shopify when present", () => {
    const view = getCartTotalsView(
      buildCart({
        totalTaxAmount: { amount: "160.00", currencyCode: "MXN" },
        totalAmount: { amount: "1160.00", currencyCode: "MXN" },
      }),
      "MX"
    );
    expect(view.taxLine).toEqual({
      amount: { amount: "160.00", currencyCode: "MXN" },
      isEstimate: false,
    });
    expect(view.total).toEqual({ amount: "1160.00", currencyCode: "MXN" });
    expect(view.totalIsEstimate).toBe(false);
  });

  it("never estimates tax for the US (sales tax varies by state)", () => {
    const cart = buildCart({
      subtotalAmount: { amount: "500.00", currencyCode: "USD" },
      totalAmount: { amount: "500.00", currencyCode: "USD" },
    });
    const view = getCartTotalsView(cart, "US");
    expect(view.taxLine).toBeNull();
    expect(view.total).toEqual({ amount: "500.00", currencyCode: "USD" });
    expect(view.totalIsEstimate).toBe(false);
  });

  it("skips the estimate for Mexico in tax-inclusive mode", () => {
    process.env.NEXT_PUBLIC_TAX_MODE = "inclusive";
    const view = getCartTotalsView(buildCart(), "MX");
    expect(view.taxLine).toBeNull();
    expect(view.totalIsEstimate).toBe(false);
  });
});
