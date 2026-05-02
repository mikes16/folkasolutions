import type { Money } from "./Money";
import type { OrderLineItem } from "./OrderLineItem";

/**
 * Shopify-defined financial states for an order.
 *
 * Modeled as a string union so an exhaustive switch in UI/use-case code is
 * compiler-checked. Mirrors the Shopify Customer Account API enum;
 * adapter-layer mappers normalize the upstream value (often UPPERCASE)
 * into one of these lowercase variants before constructing an `Order`.
 */
export type FinancialStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_paid"
  | "refunded"
  | "voided";

/**
 * Shopify-defined fulfillment states for an order.
 *
 * "fulfilled" is the only terminal-shipped state; everything else means
 * the customer is still waiting on at least part of the order, which is
 * what `isInProgress` keys off of.
 */
export type FulfillmentStatus =
  | "unfulfilled"
  | "partial"
  | "fulfilled"
  | "restocked";

/**
 * Input shape accepted by `Order.create`.
 *
 * `id` is the raw Shopify GID string. We deliberately do not validate its
 * format here: the Customer Account API returns Order GIDs of forms we
 * don't fully control, and the value is opaque to the domain. Format
 * checks belong at the boundary if ever needed.
 *
 * `totalPrice` is a pre-built `Money` (already validated). `lineItems`
 * is a `ReadonlyArray` to discourage in-place mutation by use cases.
 */
export interface OrderInput {
  id: string;
  orderNumber: string;
  processedAt: string;
  financialStatus: FinancialStatus;
  fulfillmentStatus: FulfillmentStatus;
  totalPrice: Money;
  lineItems: ReadonlyArray<OrderLineItem>;
  customerOrderUrl: string;
}

/**
 * Order entity for the customer bounded context.
 *
 * Immutable. Constructed only via `Order.create`, never `new Order`.
 * Holds enough information to render the customer-facing order list and
 * order detail screens without an additional fetch.
 *
 * `lineItems` is exposed as a `ReadonlyArray` so consumers can iterate
 * but cannot push/splice into the live order. This is structural, not
 * deep-frozen, but adequate for the trust boundary inside the domain.
 */
export class Order {
  private constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly processedAt: string,
    public readonly financialStatus: FinancialStatus,
    public readonly fulfillmentStatus: FulfillmentStatus,
    public readonly totalPrice: Money,
    public readonly lineItems: ReadonlyArray<OrderLineItem>,
    public readonly customerOrderUrl: string,
  ) {}

  static create(input: OrderInput): Order {
    if (
      typeof input.orderNumber !== "string" ||
      input.orderNumber.trim().length === 0
    ) {
      throw new Error("Order.orderNumber cannot be empty.");
    }

    if (input.lineItems.length === 0) {
      throw new Error("Order.lineItems cannot be empty.");
    }

    return new Order(
      input.id,
      input.orderNumber,
      input.processedAt,
      input.financialStatus,
      input.fulfillmentStatus,
      input.totalPrice,
      input.lineItems,
      input.customerOrderUrl,
    );
  }

  /**
   * Sum of every line item's quantity. Useful for compact summaries
   * ("3 items") in the order list without forcing the UI to walk the
   * line items itself.
   */
  get totalQuantity(): number {
    return this.lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * True when the customer is still waiting on something. Anything other
   * than a fully fulfilled order counts: unfulfilled, partial, and even
   * restocked (the latter is rare but signals the order is not done from
   * the customer's perspective).
   */
  get isInProgress(): boolean {
    return this.fulfillmentStatus !== "fulfilled";
  }
}
