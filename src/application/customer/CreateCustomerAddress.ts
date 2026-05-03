import type { Address, AddressInput } from "@/domain/customer/Address";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: persist a new address for the authenticated customer.
 *
 * `setDefault` is forwarded to the gateway so a single round-trip can both
 * create the address and mark it as the default, avoiding a second call
 * for the common "first address you save" case.
 */
export class CreateCustomerAddress {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(args: {
    input: AddressInput;
    setDefault: boolean;
  }): Promise<Address> {
    const tokens = await this.refresh.execute();
    return this.gateway.createAddress({
      accessToken: tokens.accessToken,
      input: args.input,
      setDefault: args.setDefault,
    });
  }
}
