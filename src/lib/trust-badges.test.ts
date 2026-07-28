import { describe, expect, it } from "vitest";
import { getTrustBadgeConfig } from "./trust-badges";

describe("getTrustBadgeConfig", () => {
  it("drops the official importer claim for Philips", () => {
    expect(getTrustBadgeConfig("Philips").officialImporter).toBe(false);
  });

  it("limits Philips shipping to Mexico", () => {
    expect(getTrustBadgeConfig("Philips").shippingScope).toBe("mx");
  });

  it("matches the vendor regardless of case", () => {
    expect(getTrustBadgeConfig("PHILIPS")).toEqual({
      officialImporter: false,
      shippingScope: "mx",
    });
  });

  it("matches the vendor with surrounding whitespace", () => {
    expect(getTrustBadgeConfig("  philips  ")).toEqual({
      officialImporter: false,
      shippingScope: "mx",
    });
  });

  it("keeps the default claims for an unlisted vendor", () => {
    expect(getTrustBadgeConfig("Rocket Espresso")).toEqual({
      officialImporter: true,
      shippingScope: "mx-us",
    });
  });

  it("keeps the default claims for an empty vendor", () => {
    expect(getTrustBadgeConfig("")).toEqual({
      officialImporter: true,
      shippingScope: "mx-us",
    });
  });
});
