import type { Address, AddressInput } from "@/domain/customer/Address";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: replace an existing saved address with a new payload.
 *
 * `addressId` is the Shopify GID of the address being updated. The full
 * `AddressInput` is sent rather than a partial patch because the address
 * value object validates as a whole and the UI submits all fields together.
 */
export class UpdateCustomerAddress {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(args: {
    addressId: string;
    input: AddressInput;
  }): Promise<Address> {
    const tokens = await this.refresh.execute();
    return this.gateway.updateAddress({
      accessToken: tokens.accessToken,
      addressId: args.addressId,
      input: args.input,
    });
  }
}
