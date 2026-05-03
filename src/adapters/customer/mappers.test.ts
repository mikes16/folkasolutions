import { describe, it, expect } from "vitest";
import {
  mapCustomer,
  mapAddress,
  mapAddressWithId,
  mapOrder,
  mapMoney,
  mapOrderLineItem,
} from "./mappers";

describe("mappers", () => {
  describe("mapCustomer", () => {
    it("maps a customer node with all fields populated", () => {
      const customer = mapCustomer({
        id: "gid://shopify/Customer/42",
        emailAddress: { emailAddress: "Miguel@Folka.com" },
        firstName: "Miguel",
        lastName: "López",
        phoneNumber: { phoneNumber: "+528112345678" },
      });
      expect(customer.id.value).toBe("gid://shopify/Customer/42");
      expect(customer.email.value).toBe("miguel@folka.com");
      expect(customer.firstName).toBe("Miguel");
      expect(customer.lastName).toBe("López");
      expect(customer.phone).toBe("+528112345678");
      // Marketing consent isn't fetched yet; mapper hardcodes false
      expect(customer.acceptsMarketing).toBe(false);
    });

    it("maps a null phoneNumber wrapper to null phone", () => {
      const customer = mapCustomer({
        id: "gid://shopify/Customer/1",
        emailAddress: { emailAddress: "a@b.co" },
        firstName: null,
        lastName: null,
        phoneNumber: null,
      });
      expect(customer.phone).toBeNull();
      expect(customer.firstName).toBeNull();
    });
  });

  describe("mapAddress", () => {
    it("maps a fully populated address node", () => {
      const address = mapAddress({
        id: "gid://shopify/CustomerAddress/9",
        firstName: "Miguel",
        lastName: "López",
        company: "Folka",
        address1: "Av. Constitución 100",
        address2: "Piso 3",
        city: "Monterrey",
        provinceCode: "NLE",
        countryCode: "MX",
        zip: "64000",
        phoneNumber: "+528112345678",
      });
      expect(address.address1).toBe("Av. Constitución 100");
      expect(address.address2).toBe("Piso 3");
      expect(address.company).toBe("Folka");
      expect(address.provinceCode).toBe("NLE");
      expect(address.countryCode).toBe("MX");
      expect(address.phone).toBe("+528112345678");
    });

    it("normalizes null optional fields to null on the domain object", () => {
      const address = mapAddress({
        id: "gid://shopify/CustomerAddress/2",
        firstName: "Ana",
        lastName: "Pérez",
        company: null,
        address1: "Calle 1",
        address2: null,
        city: "CDMX",
        provinceCode: "CMX",
        countryCode: "MX",
        zip: "01000",
        phoneNumber: null,
      });
      expect(address.company).toBeNull();
      expect(address.address2).toBeNull();
      expect(address.phone).toBeNull();
    });
  });

  describe("mapAddressWithId", () => {
    it("returns the GID alongside the mapped Address", () => {
      const result = mapAddressWithId({
        id: "gid://shopify/CustomerAddress/77",
        firstName: "X",
        lastName: "Y",
        company: null,
        address1: "Line 1",
        address2: null,
        city: "Austin",
        provinceCode: "TX",
        countryCode: "US",
        zip: "78701",
        phoneNumber: null,
      });
      expect(result.id).toBe("gid://shopify/CustomerAddress/77");
      expect(result.address.city).toBe("Austin");
    });
  });

  describe("mapMoney", () => {
    it("maps amount and currency", () => {
      const money = mapMoney({ amount: "199.99", currencyCode: "MXN" });
      expect(money.amount).toBe("199.99");
      expect(money.currencyCode).toBe("MXN");
    });
  });

  describe("mapOrderLineItem", () => {
    it("maps line item title, variant, quantity, price, image", () => {
      const item = mapOrderLineItem({
        title: "Slayer Steam Single",
        variantTitle: "Black",
        quantity: 1,
        price: { amount: "1500.00", currencyCode: "USD" },
        image: { url: "https://cdn.shopify.com/x.jpg" },
      });
      expect(item.title).toBe("Slayer Steam Single");
      expect(item.imageUrl).toBe("https://cdn.shopify.com/x.jpg");
      // Customer Account API doesn't expose a product reference on line items
      expect(item.productHandle).toBeNull();
    });

    it("falls back to null when image is absent", () => {
      const item = mapOrderLineItem({
        title: "Niche Zero",
        variantTitle: null,
        quantity: 2,
        price: { amount: "100.00", currencyCode: "USD" },
        image: null,
      });
      expect(item.productHandle).toBeNull();
      expect(item.imageUrl).toBeNull();
    });
  });

  describe("mapOrder", () => {
    it("maps an order node and lowercases enum statuses", () => {
      const order = mapOrder({
        id: "gid://shopify/Order/12345",
        number: "1001",
        processedAt: "2026-04-01T12:00:00Z",
        financialStatus: "PAID",
        fulfillmentStatus: "FULFILLED",
        totalPrice: { amount: "250.00", currencyCode: "USD" },
        statusPageUrl: "https://shop.com/account/orders/12345",
        lineItems: {
          edges: [
            {
              node: {
                title: "Coffee Beans 1kg",
                variantTitle: null,
                quantity: 1,
                price: { amount: "250.00", currencyCode: "USD" },
                image: null,
              },
            },
          ],
        },
      });
      expect(order.id).toBe("gid://shopify/Order/12345");
      expect(order.orderNumber).toBe("1001");
      expect(order.financialStatus).toBe("paid");
      expect(order.fulfillmentStatus).toBe("fulfilled");
      expect(order.totalPrice.amount).toBe("250.00");
      expect(order.customerOrderUrl).toBe("https://shop.com/account/orders/12345");
      expect(order.lineItems).toHaveLength(1);
    });
  });
});
