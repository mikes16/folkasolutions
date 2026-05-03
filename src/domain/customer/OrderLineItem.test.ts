import { describe, it, expect } from "vitest";
import { OrderLineItem } from "./OrderLineItem";
import { Money } from "./Money";

describe("OrderLineItem", () => {
  const baseInput = {
    title: "Rocket Espresso Mozzafiato R",
    variantTitle: "Black",
    quantity: 2,
    unitPrice: Money.of("54238.24", "MXN"),
    productHandle: "rocket-mozzafiato-r",
    imageUrl: "https://cdn.shopify.com/foo.jpg",
  };

  it("constructs from input", () => {
    const li = OrderLineItem.create(baseInput);
    expect(li.title).toBe("Rocket Espresso Mozzafiato R");
    expect(li.quantity).toBe(2);
  });

  it("computes subtotal as unitPrice times quantity", () => {
    const li = OrderLineItem.create({
      ...baseInput,
      quantity: 3,
      unitPrice: Money.of("100", "MXN"),
    });
    expect(li.subtotal.amount).toBe("300.00");
    expect(li.subtotal.currencyCode).toBe("MXN");
  });

  it("accepts null variantTitle, productHandle, imageUrl", () => {
    const li = OrderLineItem.create({
      ...baseInput,
      variantTitle: null,
      productHandle: null,
      imageUrl: null,
    });
    expect(li.variantTitle).toBeNull();
  });

  it("rejects empty title", () => {
    expect(() =>
      OrderLineItem.create({ ...baseInput, title: "" }),
    ).toThrow();
  });

  it("rejects non-positive quantity", () => {
    expect(() =>
      OrderLineItem.create({ ...baseInput, quantity: 0 }),
    ).toThrow();
    expect(() =>
      OrderLineItem.create({ ...baseInput, quantity: -1 }),
    ).toThrow();
  });
});
