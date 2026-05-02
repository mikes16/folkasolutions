import type { Customer } from "@/domain/customer/Customer";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: fetch the authenticated customer's profile.
 *
 * Refreshes the access token if it is near expiry, then delegates to the
 * `CustomerAccountGateway` port. The gateway is the only thing that knows
 * how to talk to Shopify; this class just wires the two together.
 */
export class GetCustomerProfile {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(): Promise<Customer> {
    const tokens = await this.refresh.execute();
    return this.gateway.getProfile(tokens.accessToken);
  }
}
