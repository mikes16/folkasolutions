import { describe, it, expect, vi } from "vitest";

import { Customer } from "@/domain/customer/Customer";
import { CustomerId } from "@/domain/customer/CustomerId";
import { Email } from "@/domain/customer/Email";
import { Address } from "@/domain/customer/Address";
import { Order } from "@/domain/customer/Order";
import { OrderLineItem } from "@/domain/customer/OrderLineItem";
import { Money } from "@/domain/customer/Money";

import { GetCustomerProfile } from "./GetCustomerProfile";
import { GetCustomerOrders } from "./GetCustomerOrders";
import { GetOrderDetail } from "./GetOrderDetail";
import { ListCustomerAddresses } from "./ListCustomerAddresses";

import type { CustomerAccountGateway, TokenSet } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

const tokens: TokenSet = {
  accessToken: "at",
  refreshToken: "rt",
  idToken: "id",
  expiresAt: new Date(Date.now() + 3_600_000),
};

function makeRefresh(): RefreshAccessToken {
  // Stub. We don't construct a real RefreshAccessToken here because that
  // would require stubbing OAuthClient and SessionStore as well. The
  // refresh policy itself is tested separately.
  return {
    execute: vi.fn().mockResolvedValue(tokens),
  } as unknown as RefreshAccessToken;
}

function makeOrder(): Order {
  return Order.create({
    id: "gid://shopify/Order/1",
    orderNumber: "F-1",
    processedAt: "2026-04-25T21:47:00Z",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    totalPrice: Money.of("100", "MXN"),
    lineItems: [
      OrderLineItem.create({
        title: "Cinquantotto",
        variantTitle: null,
        quantity: 1,
        unitPrice: Money.of("100", "MXN"),
        productHandle: "cinquantotto",
        imageUrl: null,
      }),
    ],
    customerOrderUrl: "https://example.com/orders/1",
  });
}

describe("GetCustomerProfile", () => {
  it("calls gateway.getProfile with refreshed access token", async () => {
    const customer = Customer.create({
      id: CustomerId.from("gid://shopify/Customer/1"),
      email: Email.from("a@b.com"),
      firstName: "A",
      lastName: "B",
      phone: null,
      acceptsMarketing: false,
    });
    const gateway: Pick<CustomerAccountGateway, "getProfile"> = {
      getProfile: vi.fn().mockResolvedValue(customer),
    };

    const useCase = new GetCustomerProfile(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute();

    expect(result).toBe(customer);
    expect(gateway.getProfile).toHaveBeenCalledWith("at");
  });
});

describe("GetCustomerOrders", () => {
  it("calls gateway.getOrders with refreshed access token and pagination args", async () => {
    const page = {
      orders: [makeOrder()],
      nextCursor: "cursor-2",
      hasNextPage: true,
    };
    const gateway: Pick<CustomerAccountGateway, "getOrders"> = {
      getOrders: vi.fn().mockResolvedValue(page),
    };

    const useCase = new GetCustomerOrders(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute({ cursor: "cursor-1", pageSize: 10 });

    expect(result).toBe(page);
    expect(gateway.getOrders).toHaveBeenCalledWith({
      accessToken: "at",
      cursor: "cursor-1",
      pageSize: 10,
    });
  });
});

describe("GetOrderDetail", () => {
  it("calls gateway.getOrder with refreshed access token and order id", async () => {
    const order = makeOrder();
    const gateway: Pick<CustomerAccountGateway, "getOrder"> = {
      getOrder: vi.fn().mockResolvedValue(order),
    };

    const useCase = new GetOrderDetail(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute("gid://shopify/Order/1");

    expect(result).toBe(order);
    expect(gateway.getOrder).toHaveBeenCalledWith({
      accessToken: "at",
      orderId: "gid://shopify/Order/1",
    });
  });
});

describe("ListCustomerAddresses", () => {
  it("calls gateway.listAddresses with refreshed access token", async () => {
    const payload = {
      addresses: [
        Address.create({
          firstName: "M",
          lastName: "L",
          address1: "Av Garza Sada 6518",
          city: "Monterrey",
          countryCode: "MX",
          zip: "64960",
          provinceCode: "NLE",
        }),
      ],
      defaultAddressId: "gid://shopify/MailingAddress/1",
    };
    const gateway: Pick<CustomerAccountGateway, "listAddresses"> = {
      listAddresses: vi.fn().mockResolvedValue(payload),
    };

    const useCase = new ListCustomerAddresses(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute();

    expect(result).toBe(payload);
    expect(gateway.listAddresses).toHaveBeenCalledWith("at");
  });
});
