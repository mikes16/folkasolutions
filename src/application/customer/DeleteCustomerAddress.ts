import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: remove a saved address from the authenticated customer's book.
 *
 * Returns `void`; callers should refetch the address list after deletion
 * if they need an updated default-address pointer.
 */
export class DeleteCustomerAddress {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(addressId: string): Promise<void> {
    const tokens = await this.refresh.execute();
    await this.gateway.deleteAddress({
      accessToken: tokens.accessToken,
      addressId,
    });
  }
}
