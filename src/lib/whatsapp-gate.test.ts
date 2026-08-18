import { describe, expect, it } from "vitest";
import { shouldShowWhatsappCta } from "./whatsapp-gate";

describe("shouldShowWhatsappCta", () => {
  it("hides the CTA just below the Mexican threshold", () => {
    expect(
      shouldShowWhatsappCta({ amount: "14999.99", currencyCode: "MXN" })
    ).toBe(false);
  });

  it("shows the CTA exactly at the Mexican threshold", () => {
    expect(
      shouldShowWhatsappCta({ amount: "15000.00", currencyCode: "MXN" })
    ).toBe(true);
  });

  it("shows the CTA for a mid-range espresso machine in MXN", () => {
    expect(
      shouldShowWhatsappCta({ amount: "25434.00", currencyCode: "MXN" })
    ).toBe(true);
  });

  it("hides the CTA for accessories and small brewing gear in MXN", () => {
    expect(shouldShowWhatsappCta({ amount: "4810.08", currencyCode: "MXN" })).toBe(
      false
    );
  });

  it("shows the CTA exactly at the US threshold", () => {
    expect(shouldShowWhatsappCta({ amount: "800.00", currencyCode: "USD" })).toBe(
      true
    );
  });

  it("hides the CTA just below the US threshold", () => {
    expect(shouldShowWhatsappCta({ amount: "799.00", currencyCode: "USD" })).toBe(
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
