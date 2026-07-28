import { describe, expect, it } from "vitest";
import { shouldShowWhatsappCta } from "./whatsapp-gate";

describe("shouldShowWhatsappCta", () => {
  it("hides the CTA just below the Mexican threshold", () => {
    expect(
      shouldShowWhatsappCta({ amount: "99999.99", currencyCode: "MXN" })
    ).toBe(false);
  });

  it("shows the CTA exactly at the Mexican threshold", () => {
    expect(
      shouldShowWhatsappCta({ amount: "100000.00", currencyCode: "MXN" })
    ).toBe(true);
  });

  it("shows the CTA exactly at the US threshold", () => {
    expect(shouldShowWhatsappCta({ amount: "5000.00", currencyCode: "USD" })).toBe(
      true
    );
  });

  it("hides the CTA just below the US threshold", () => {
    expect(shouldShowWhatsappCta({ amount: "4999.00", currencyCode: "USD" })).toBe(
      false
    );
  });

  it("hides the CTA for a currency with no configured threshold", () => {
    expect(
      shouldShowWhatsappCta({ amount: "999999.00", currencyCode: "EUR" })
    ).toBe(false);
  });

  it("hides the CTA when the amount is not parseable", () => {
    expect(shouldShowWhatsappCta({ amount: "", currencyCode: "MXN" })).toBe(false);
  });
});
