import type { Address } from "@/domain/customer/Address";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: fetch the customer's saved addresses plus the id of the one
 * marked as default.
 *
 * The default id is returned alongside the addresses (rather than as a
 * boolean flag on each `Address`) because the value object is concerned
 * with postal data, not customer-scoped metadata.
 */
export class ListCustomerAddresses {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(): Promise<{
    addresses: Address[];
    defaultAddressId: string | null;
  }> {
    const tokens = await this.refresh.execute();
    return this.gateway.listAddresses(tokens.accessToken);
  }
}
