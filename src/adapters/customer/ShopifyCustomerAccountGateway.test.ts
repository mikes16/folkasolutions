import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ShopifyCustomerAccountGateway } from "./ShopifyCustomerAccountGateway";

const apiUrl = "https://shopify.com/123/account/customer/api/2026-01/graphql";

type FetchMock = ReturnType<typeof vi.fn>;

function mockJson(body: unknown, ok = true, status = 200): void {
  (global.fetch as FetchMock).mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  });
}

function getCall(index = 0): {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: { query: string; variables?: Record<string, unknown> };
} {
  const [url, opts] = (global.fetch as FetchMock).mock.calls[index];
  return {
    url: url as string,
    method: opts.method as string,
    headers: opts.headers as Record<string, string>,
    body: JSON.parse(opts.body as string),
  };
}

function buildCustomerNode() {
  return {
    id: "gid://shopify/Customer/1",
    emailAddress: { emailAddress: "miguel@folka.com" },
    firstName: "Miguel",
    lastName: "López",
    phoneNumber: { phoneNumber: "+528112345678" },
  };
}

function buildAddressNode(id = "gid://shopify/CustomerAddress/9") {
  return {
    id,
    firstName: "Miguel",
    lastName: "López",
    company: null,
    address1: "Av. Constitución 100",
    address2: null,
    city: "Monterrey",
    provinceCode: "NLE",
    countryCode: "MX",
    zip: "64000",
    phoneNumber: "+528112345678",
  };
}

function buildOrderNode(id = "gid://shopify/Order/12345") {
  return {
    id,
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
  };
}

describe("ShopifyCustomerAccountGateway", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getProfile", () => {
    it("queries the GraphQL endpoint with the correct headers and maps the customer", async () => {
      mockJson({ data: { customer: buildCustomerNode() } });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const customer = await gateway.getProfile("test-token");

      expect(customer.email.value).toBe("miguel@folka.com");
      expect(customer.firstName).toBe("Miguel");
      const call = getCall();
      expect(call.url).toBe(apiUrl);
      expect(call.method).toBe("POST");
      expect(call.headers.Authorization).toBe("test-token");
      expect(call.headers["Content-Type"]).toBe("application/json");
      expect(call.body.query).toContain("query CustomerProfile");
    });

    it("throws when the GraphQL response carries errors[]", async () => {
      mockJson({ errors: [{ message: "Unauthorized" }] });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await expect(gateway.getProfile("bad-token")).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("throws when the HTTP layer reports a non-ok status", async () => {
      (global.fetch as FetchMock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
        text: async () => "Unauthorized",
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await expect(gateway.getProfile("bad-token")).rejects.toThrow(
        "Customer Account API 401",
      );
    });
  });

  describe("updateProfile", () => {
    it("sends only the keys present in update and maps the result", async () => {
      mockJson({
        data: {
          customerUpdate: {
            customer: { ...buildCustomerNode(), firstName: "Updated" },
            userErrors: [],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const customer = await gateway.updateProfile({
        accessToken: "tok",
        update: { firstName: "Updated", phone: "+1234567" },
      });
      expect(customer.firstName).toBe("Updated");
      const call = getCall();
      expect(call.body.query).toContain("mutation CustomerUpdate");
      expect(call.body.variables).toEqual({
        input: {
          firstName: "Updated",
          phoneNumber: { phoneNumber: "+1234567" },
        },
      });
    });

    it("wraps a null phone update as a null phoneNumber", async () => {
      mockJson({
        data: {
          customerUpdate: {
            customer: { ...buildCustomerNode(), phoneNumber: null },
            userErrors: [],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await gateway.updateProfile({
        accessToken: "tok",
        update: { phone: null },
      });
      const call = getCall();
      expect(call.body.variables).toEqual({
        input: { phoneNumber: null },
      });
    });

    it("throws when userErrors is non-empty", async () => {
      mockJson({
        data: {
          customerUpdate: {
            customer: buildCustomerNode(),
            userErrors: [{ field: ["firstName"], message: "Too short" }],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await expect(
        gateway.updateProfile({
          accessToken: "tok",
          update: { firstName: "X" },
        }),
      ).rejects.toThrow("Too short");
    });
  });

  describe("getOrders", () => {
    it("paginates with first/after and surfaces nextCursor when hasNextPage is true", async () => {
      mockJson({
        data: {
          customer: {
            orders: {
              edges: [{ cursor: "c1", node: buildOrderNode() }],
              pageInfo: { hasNextPage: true, endCursor: "cursor-end" },
            },
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const result = await gateway.getOrders({
        accessToken: "tok",
        cursor: null,
        pageSize: 10,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].financialStatus).toBe("paid");
      expect(result.hasNextPage).toBe(true);
      expect(result.nextCursor).toBe("cursor-end");
      const call = getCall();
      expect(call.body.variables).toEqual({ first: 10, after: null });
    });

    it("returns null nextCursor when hasNextPage is false even if endCursor exists", async () => {
      mockJson({
        data: {
          customer: {
            orders: {
              edges: [{ cursor: "c1", node: buildOrderNode() }],
              pageInfo: { hasNextPage: false, endCursor: "ignored-cursor" },
            },
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const result = await gateway.getOrders({
        accessToken: "tok",
        cursor: "prev",
        pageSize: 5,
      });
      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe("getOrder", () => {
    it("queries by id and maps the order", async () => {
      mockJson({ data: { order: buildOrderNode() } });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const order = await gateway.getOrder({
        accessToken: "tok",
        orderId: "gid://shopify/Order/12345",
      });
      expect(order.id).toBe("gid://shopify/Order/12345");
      expect(order.fulfillmentStatus).toBe("fulfilled");
      const call = getCall();
      expect(call.body.variables).toEqual({
        id: "gid://shopify/Order/12345",
      });
    });

    it("throws when the order is not found", async () => {
      mockJson({ data: { order: null } });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await expect(
        gateway.getOrder({
          accessToken: "tok",
          orderId: "gid://shopify/Order/missing",
        }),
      ).rejects.toThrow("not found");
    });
  });

  describe("listAddresses", () => {
    it("returns addresses paired with their GID and defaultAddressId", async () => {
      mockJson({
        data: {
          customer: {
            defaultAddress: { id: "gid://shopify/CustomerAddress/9" },
            addresses: { edges: [{ node: buildAddressNode() }] },
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const result = await gateway.listAddresses("tok");
      expect(result.addresses).toHaveLength(1);
      expect(result.addresses[0].id).toBe("gid://shopify/CustomerAddress/9");
      expect(result.addresses[0].address.city).toBe("Monterrey");
      expect(result.defaultAddressId).toBe(
        "gid://shopify/CustomerAddress/9",
      );
    });

    it("returns null defaultAddressId when no default is set", async () => {
      mockJson({
        data: {
          customer: {
            defaultAddress: null,
            addresses: { edges: [] },
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const result = await gateway.listAddresses("tok");
      expect(result.addresses).toHaveLength(0);
      expect(result.defaultAddressId).toBeNull();
    });
  });

  describe("createAddress", () => {
    it("translates phone/provinceCode and forwards setDefault", async () => {
      mockJson({
        data: {
          customerAddressCreate: {
            customerAddress: buildAddressNode(),
            userErrors: [],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      const address = await gateway.createAddress({
        accessToken: "tok",
        setDefault: true,
        input: {
          firstName: "Miguel",
          lastName: "López",
          address1: "Av. Constitución 100",
          city: "Monterrey",
          countryCode: "MX",
          zip: "64000",
          provinceCode: "NLE",
          phone: "+528112345678",
        },
      });
      expect(address.city).toBe("Monterrey");
      const call = getCall();
      expect(call.body.variables).toEqual({
        defaultAddress: true,
        address: {
          firstName: "Miguel",
          lastName: "López",
          company: null,
          address1: "Av. Constitución 100",
          address2: null,
          city: "Monterrey",
          zoneCode: "NLE",
          territoryCode: "MX",
          zip: "64000",
          phoneNumber: "+528112345678",
        },
      });
    });

    it("throws when userErrors is non-empty", async () => {
      mockJson({
        data: {
          customerAddressCreate: {
            customerAddress: buildAddressNode(),
            userErrors: [{ field: ["zip"], message: "Invalid zip" }],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await expect(
        gateway.createAddress({
          accessToken: "tok",
          setDefault: false,
          input: {
            firstName: "X",
            lastName: "Y",
            address1: "Line",
            city: "Austin",
            countryCode: "US",
            zip: "BAD",
            provinceCode: "TX",
          },
        }),
      ).rejects.toThrow("Invalid zip");
    });
  });

  describe("updateAddress", () => {
    it("sends addressId and translated input", async () => {
      mockJson({
        data: {
          customerAddressUpdate: {
            customerAddress: buildAddressNode(),
            userErrors: [],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await gateway.updateAddress({
        accessToken: "tok",
        addressId: "gid://shopify/CustomerAddress/9",
        input: {
          firstName: "Miguel",
          lastName: "López",
          address1: "Av. Constitución 100",
          city: "Monterrey",
          countryCode: "MX",
          zip: "64000",
          provinceCode: "NLE",
        },
      });
      const call = getCall();
      expect(call.body.query).toContain("mutation CustomerAddressUpdate");
      expect(call.body.variables).toEqual({
        addressId: "gid://shopify/CustomerAddress/9",
        address: {
          firstName: "Miguel",
          lastName: "López",
          company: null,
          address1: "Av. Constitución 100",
          address2: null,
          city: "Monterrey",
          zoneCode: "NLE",
          territoryCode: "MX",
          zip: "64000",
          phoneNumber: null,
        },
      });
    });

    it("throws when userErrors is non-empty", async () => {
      mockJson({
        data: {
          customerAddressUpdate: {
            customerAddress: buildAddressNode(),
            userErrors: [{ field: null, message: "Update failed" }],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await expect(
        gateway.updateAddress({
          accessToken: "tok",
          addressId: "gid://shopify/CustomerAddress/9",
          input: {
            firstName: "Miguel",
            lastName: "López",
            address1: "Av. Constitución 100",
            city: "Monterrey",
            countryCode: "MX",
            zip: "64000",
            provinceCode: "NLE",
          },
        }),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("deleteAddress", () => {
    it("sends addressId and resolves on success", async () => {
      mockJson({
        data: {
          customerAddressDelete: {
            deletedAddressId: "gid://shopify/CustomerAddress/9",
            userErrors: [],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await gateway.deleteAddress({
        accessToken: "tok",
        addressId: "gid://shopify/CustomerAddress/9",
      });
      const call = getCall();
      expect(call.body.query).toContain("mutation CustomerAddressDelete");
      expect(call.body.variables).toEqual({
        addressId: "gid://shopify/CustomerAddress/9",
      });
    });

    it("throws when userErrors is non-empty", async () => {
      mockJson({
        data: {
          customerAddressDelete: {
            deletedAddressId: null,
            userErrors: [{ field: null, message: "Cannot delete default" }],
          },
        },
      });
      const gateway = new ShopifyCustomerAccountGateway(apiUrl);
      await expect(
        gateway.deleteAddress({
          accessToken: "tok",
          addressId: "gid://shopify/CustomerAddress/9",
        }),
      ).rejects.toThrow("Cannot delete default");
    });
  });
});
