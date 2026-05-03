import { describe, it, expect, vi } from "vitest";

import { Customer } from "@/domain/customer/Customer";
import { CustomerId } from "@/domain/customer/CustomerId";
import { Email } from "@/domain/customer/Email";
import { Address } from "@/domain/customer/Address";
import type { AddressInput } from "@/domain/customer/Address";

import { UpdateCustomerProfile } from "./UpdateCustomerProfile";
import { CreateCustomerAddress } from "./CreateCustomerAddress";
import { UpdateCustomerAddress } from "./UpdateCustomerAddress";
import { DeleteCustomerAddress } from "./DeleteCustomerAddress";

import type { CustomerAccountGateway, TokenSet } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

const tokens: TokenSet = {
  accessToken: "at",
  refreshToken: "rt",
  idToken: "id",
  expiresAt: new Date(Date.now() + 3_600_000),
};

function makeRefresh(): RefreshAccessToken {
  // Stub. See read-use-cases.test.ts for the rationale.
  return {
    execute: vi.fn().mockResolvedValue(tokens),
  } as unknown as RefreshAccessToken;
}

const sampleAddressInput: AddressInput = {
  firstName: "M",
  lastName: "L",
  address1: "Av Garza Sada 6518",
  city: "Monterrey",
  countryCode: "MX",
  zip: "64960",
  provinceCode: "NLE",
};

function makeAddress(): Address {
  return Address.create(sampleAddressInput);
}

describe("UpdateCustomerProfile", () => {
  it("calls gateway.updateProfile with refreshed access token and update", async () => {
    const customer = Customer.create({
      id: CustomerId.from("gid://shopify/Customer/1"),
      email: Email.from("a@b.com"),
      firstName: "A",
      lastName: "B",
      phone: null,
      acceptsMarketing: true,
    });
    const gateway: Pick<CustomerAccountGateway, "updateProfile"> = {
      updateProfile: vi.fn().mockResolvedValue(customer),
    };
    const update = { firstName: "A", acceptsMarketing: true };

    const useCase = new UpdateCustomerProfile(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute(update);

    expect(result).toBe(customer);
    expect(gateway.updateProfile).toHaveBeenCalledWith({
      accessToken: "at",
      update,
    });
  });
});

describe("CreateCustomerAddress", () => {
  it("calls gateway.createAddress with refreshed access token, input, and setDefault", async () => {
    const address = makeAddress();
    const gateway: Pick<CustomerAccountGateway, "createAddress"> = {
      createAddress: vi.fn().mockResolvedValue(address),
    };

    const useCase = new CreateCustomerAddress(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute({
      input: sampleAddressInput,
      setDefault: true,
    });

    expect(result).toBe(address);
    expect(gateway.createAddress).toHaveBeenCalledWith({
      accessToken: "at",
      input: sampleAddressInput,
      setDefault: true,
    });
  });
});

describe("UpdateCustomerAddress", () => {
  it("calls gateway.updateAddress with refreshed access token, addressId, and input", async () => {
    const address = makeAddress();
    const gateway: Pick<CustomerAccountGateway, "updateAddress"> = {
      updateAddress: vi.fn().mockResolvedValue(address),
    };

    const useCase = new UpdateCustomerAddress(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute({
      addressId: "gid://shopify/MailingAddress/1",
      input: sampleAddressInput,
    });

    expect(result).toBe(address);
    expect(gateway.updateAddress).toHaveBeenCalledWith({
      accessToken: "at",
      addressId: "gid://shopify/MailingAddress/1",
      input: sampleAddressInput,
    });
  });
});

describe("DeleteCustomerAddress", () => {
  it("calls gateway.deleteAddress with refreshed access token and addressId", async () => {
    const gateway: Pick<CustomerAccountGateway, "deleteAddress"> = {
      deleteAddress: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new DeleteCustomerAddress(
      makeRefresh(),
      gateway as CustomerAccountGateway,
    );
    const result = await useCase.execute("gid://shopify/MailingAddress/1");

    expect(result).toBeUndefined();
    expect(gateway.deleteAddress).toHaveBeenCalledWith({
      accessToken: "at",
      addressId: "gid://shopify/MailingAddress/1",
    });
  });
});
