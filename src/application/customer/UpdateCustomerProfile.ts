import type { Customer, ProfileUpdate } from "@/domain/customer/Customer";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: apply a partial profile patch to the authenticated customer.
 *
 * The semantics of `ProfileUpdate` (absent key preserves, `null` clears)
 * are documented on `Customer.withProfile`. The gateway is responsible for
 * translating that contract into whatever Shopify's API expects.
 */
export class UpdateCustomerProfile {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(update: ProfileUpdate): Promise<Customer> {
    const tokens = await this.refresh.execute();
    return this.gateway.updateProfile({
      accessToken: tokens.accessToken,
      update,
    });
  }
}
