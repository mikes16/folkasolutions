import { describe, it, expect } from "vitest";
import { CustomerId } from "./CustomerId";

describe("CustomerId", () => {
  it("wraps a valid Shopify GID", () => {
    const id = CustomerId.from("gid://shopify/Customer/123456789");
    expect(id.value).toBe("gid://shopify/Customer/123456789");
  });

  it("rejects empty string", () => {
    expect(() => CustomerId.from("")).toThrow();
  });

  it("rejects strings that aren't Shopify GIDs", () => {
    expect(() => CustomerId.from("just-a-number")).toThrow();
  });

  it("rejects GIDs for other resource types", () => {
    expect(() => CustomerId.from("gid://shopify/Order/1")).toThrow();
  });

  it("rejects GIDs with non-numeric ids", () => {
    expect(() => CustomerId.from("gid://shopify/Customer/abc")).toThrow();
  });

  it("considers two equal-valued ids as equal", () => {
    const a = CustomerId.from("gid://shopify/Customer/1");
    const b = CustomerId.from("gid://shopify/Customer/1");
    expect(a.equals(b)).toBe(true);
  });

  it("considers two different ids as not equal", () => {
    const a = CustomerId.from("gid://shopify/Customer/1");
    const b = CustomerId.from("gid://shopify/Customer/2");
    expect(a.equals(b)).toBe(false);
  });
});
