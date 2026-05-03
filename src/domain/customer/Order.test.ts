import { describe, it, expect } from "vitest";
import { Order } from "./Order";
import { OrderLineItem } from "./OrderLineItem";
import { Money } from "./Money";

const lineItem = OrderLineItem.create({
  title: "Rocket Espresso Mozzafiato R",
  variantTitle: "Black",
  quantity: 2,
  unitPrice: Money.of("54238.24", "MXN"),
  productHandle: "rocket-mozzafiato-r",
  imageUrl: "https://cdn.shopify.com/foo.jpg",
});

describe("Order", () => {
  const baseInput = {
    id: "gid://shopify/Order/1",
    orderNumber: "FOLKA-1042",
    processedAt: "2026-04-25T21:47:00Z",
    financialStatus: "paid" as const,
    fulfillmentStatus: "fulfilled" as const,
    totalPrice: Money.of("108476.48", "MXN"),
    lineItems: [lineItem],
    customerOrderUrl: "https://shopify.com/123/account/orders/foo",
  };

  it("constructs from input", () => {
    const order = Order.create(baseInput);
    expect(order.orderNumber).toBe("FOLKA-1042");
    expect(order.lineItems).toHaveLength(1);
  });

  it("computes totalQuantity as sum of line item quantities", () => {
    const order = Order.create(baseInput);
    expect(order.totalQuantity).toBe(2);
  });

  it("isInProgress is false when fulfilled", () => {
    const order = Order.create(baseInput);
    expect(order.isInProgress).toBe(false);
  });

  it("isInProgress is true when not yet fulfilled", () => {
    const order = Order.create({
      ...baseInput,
      fulfillmentStatus: "unfulfilled",
    });
    expect(order.isInProgress).toBe(true);
  });

  it("isInProgress is true when partially fulfilled", () => {
    const order = Order.create({ ...baseInput, fulfillmentStatus: "partial" });
    expect(order.isInProgress).toBe(true);
  });

  it("rejects empty orderNumber", () => {
    expect(() =>
      Order.create({ ...baseInput, orderNumber: "" }),
    ).toThrow();
  });

  it("rejects empty lineItems", () => {
    expect(() => Order.create({ ...baseInput, lineItems: [] })).toThrow();
  });
});
