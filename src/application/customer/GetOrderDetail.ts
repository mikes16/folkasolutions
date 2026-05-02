import type { Order } from "@/domain/customer/Order";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: fetch a single order by its Shopify GID.
 *
 * The gateway enforces that the order belongs to the authenticated
 * customer; the use case stays thin and only handles token refresh.
 */
export class GetOrderDetail {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(orderId: string): Promise<Order> {
    const tokens = await this.refresh.execute();
    return this.gateway.getOrder({
      accessToken: tokens.accessToken,
      orderId,
    });
  }
}
