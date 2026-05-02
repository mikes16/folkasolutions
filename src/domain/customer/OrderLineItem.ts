import { Money } from "./Money";

/**
 * Input shape accepted by `OrderLineItem.create`.
 *
 * `unitPrice` is typed as `Money` (already validated) so the line item
 * does not re-check currency shape. Optional descriptive fields use
 * `string | null` rather than `?` because Shopify always returns a value
 * for these slots — sometimes empty — and forcing the caller to pass
 * `null` explicitly makes the absence intentional rather than accidental.
 */
export interface OrderLineItemInput {
  title: string;
  variantTitle: string | null;
  quantity: number;
  unitPrice: Money;
  productHandle: string | null;
  imageUrl: string | null;
}

/**
 * A single line on an `Order`.
 *
 * Immutable. Constructed only via `OrderLineItem.create`, never
 * `new OrderLineItem`. `subtotal` is computed lazily on each access via
 * `unitPrice.times(quantity)`; the math is cheap and keeping it derived
 * avoids a second source of truth.
 *
 * Validates that `title` is non-empty and `quantity` is a positive integer.
 * A line item with zero quantity is meaningless (Shopify removes those at
 * the order level), and fractional quantities don't apply to the products
 * Folka sells.
 */
export class OrderLineItem {
  private constructor(
    public readonly title: string,
    public readonly variantTitle: string | null,
    public readonly quantity: number,
    public readonly unitPrice: Money,
    public readonly productHandle: string | null,
    public readonly imageUrl: string | null,
  ) {}

  static create(input: OrderLineItemInput): OrderLineItem {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      throw new Error("OrderLineItem.title cannot be empty.");
    }

    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new Error(
        `OrderLineItem.quantity must be a positive integer, received ${input.quantity}.`,
      );
    }

    return new OrderLineItem(
      input.title,
      input.variantTitle,
      input.quantity,
      input.unitPrice,
      input.productHandle,
      input.imageUrl,
    );
  }

  get subtotal(): Money {
    return this.unitPrice.times(this.quantity);
  }
}
