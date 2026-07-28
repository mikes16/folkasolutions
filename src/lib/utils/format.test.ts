import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("keeps whole MXN amounts without decimals", () => {
    expect(formatMoney({ amount: "12999", currencyCode: "MXN" })).toBe(
      "$12,999"
    );
  });

  it("preserves MXN cents instead of rounding them away", () => {
    // Rounding to "$25,000" would visibly disagree with Shopify's checkout.
    expect(formatMoney({ amount: "24999.50", currencyCode: "MXN" })).toBe(
      "$24,999.50"
    );
  });

  it("always shows two decimals for USD", () => {
    expect(formatMoney({ amount: "500", currencyCode: "USD" })).toBe("$500.00");
  });
});
