import type { Order } from "@/domain/customer/Order";
import type { CustomerAccountGateway } from "./ports";
import { RefreshAccessToken } from "./RefreshAccessToken";

/**
 * Use case: fetch a paginated page of the authenticated customer's orders.
 *
 * `cursor` is the opaque pagination cursor returned by the previous page,
 * or `null` for the first page. `pageSize` is forwarded verbatim to the
 * gateway, which knows whatever upstream limit Shopify enforces.
 */
export class GetCustomerOrders {
  constructor(
    private readonly refresh: RefreshAccessToken,
    private readonly gateway: CustomerAccountGateway,
  ) {}

  async execute(args: {
    cursor: string | null;
    pageSize: number;
  }): Promise<{
    orders: Order[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> {
    const tokens = await this.refresh.execute();
    return this.gateway.getOrders({
      accessToken: tokens.accessToken,
      cursor: args.cursor,
      pageSize: args.pageSize,
    });
  }
}
