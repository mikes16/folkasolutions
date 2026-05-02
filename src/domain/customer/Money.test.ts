import { describe, it, expect } from "vitest";
import { Money } from "./Money";

describe("Money", () => {
  it("constructs from valid amount and currency", () => {
    const m = Money.of("100.50", "MXN");
    expect(m.amount).toBe("100.50");
    expect(m.currencyCode).toBe("MXN");
  });

  it("accepts integer amounts", () => {
    expect(Money.of("100", "USD").amount).toBe("100");
  });

  it("accepts amounts with up to 2 decimal places", () => {
    expect(Money.of("100.5", "USD").amount).toBe("100.5");
    expect(Money.of("100.55", "USD").amount).toBe("100.55");
  });

  it("rejects amounts with more than 2 decimal places", () => {
    expect(() => Money.of("100.555", "USD")).toThrow();
  });

  it("rejects negative amounts", () => {
    expect(() => Money.of("-100", "USD")).toThrow();
  });

  it("rejects non-numeric amounts", () => {
    expect(() => Money.of("abc", "USD")).toThrow();
  });

  it("rejects empty amount", () => {
    expect(() => Money.of("", "USD")).toThrow();
  });

  it("rejects lowercase currency", () => {
    expect(() => Money.of("100", "usd")).toThrow();
  });

  it("rejects currency that isn't 3 letters", () => {
    expect(() => Money.of("100", "US")).toThrow();
    expect(() => Money.of("100", "USDD")).toThrow();
  });

  it("times multiplies amount by integer quantity", () => {
    const m = Money.of("10.50", "MXN");
    expect(m.times(3).amount).toBe("31.50");
    expect(m.times(3).currencyCode).toBe("MXN");
  });

  it("times with quantity 1 returns equivalent value", () => {
    const m = Money.of("10.50", "MXN");
    expect(m.times(1).amount).toBe("10.50");
  });

  it("times with quantity 0 returns zero amount", () => {
    const m = Money.of("10.50", "MXN");
    expect(m.times(0).amount).toBe("0.00");
  });

  it("rejects non-integer or negative quantity in times", () => {
    const m = Money.of("10.50", "MXN");
    expect(() => m.times(1.5)).toThrow();
    expect(() => m.times(-1)).toThrow();
  });

  it("considers two equal-valued Money equal", () => {
    expect(Money.of("100", "MXN").equals(Money.of("100", "MXN"))).toBe(true);
  });

  it("considers different currencies not equal", () => {
    expect(Money.of("100", "MXN").equals(Money.of("100", "USD"))).toBe(false);
  });
});
