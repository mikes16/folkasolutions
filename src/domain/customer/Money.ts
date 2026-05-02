/**
 * Validates a decimal money amount string.
 *
 * Accepts a non-negative integer or fixed-point decimal with at most two
 * fractional digits (e.g. `"100"`, `"100.5"`, `"100.55"`). The decimal
 * string form is intentional: storing money as `number` invites floating
 * point drift (`0.1 + 0.2 !== 0.3`), and the boundary with Shopify already
 * speaks decimal strings, so we keep the same representation throughout.
 *
 * Rejecting a leading sign and the unary minus also rules out negative
 * money, which has no meaning in this domain (orders, line items).
 */
const MONEY_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Validates an ISO 4217 currency code shape.
 *
 * Exactly three uppercase ASCII letters. We do not maintain a whitelist of
 * codes here. The boundary (Shopify) already speaks valid ISO codes, and
 * keeping the rule structural avoids a maintenance burden every time a new
 * code is added or a market is enabled.
 */
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

/**
 * Money as a domain value object.
 *
 * Pairs a non-negative decimal `amount` (kept as a string for currency
 * precision) with a 3-letter ISO 4217 `currencyCode`. Constructed only via
 * `Money.of`, never `new Money`. Arithmetic returns new instances; existing
 * instances are never mutated.
 *
 * `times` uses `parseFloat` + `toFixed(2)` for line-item subtotal math.
 * That is acceptable for the magnitudes we see in practice (Shopify orders
 * stay well below the IEEE-754 safe-integer ceiling for cents). If we ever
 * need exact arbitrary-precision arithmetic (multi-currency totals,
 * weighted averages), a real BigDecimal library belongs here.
 */
export class Money {
  private constructor(
    public readonly amount: string,
    public readonly currencyCode: string,
  ) {}

  static of(amount: string, currencyCode: string): Money {
    if (typeof amount !== "string" || !MONEY_AMOUNT_PATTERN.test(amount)) {
      throw new Error(
        `Invalid Money amount: expected non-negative decimal string with up to 2 fractional digits, received ${JSON.stringify(amount)}.`,
      );
    }

    if (
      typeof currencyCode !== "string" ||
      !CURRENCY_CODE_PATTERN.test(currencyCode)
    ) {
      throw new Error(
        `Invalid Money currencyCode: expected 3 uppercase letters (ISO 4217), received ${JSON.stringify(currencyCode)}.`,
      );
    }

    return new Money(amount, currencyCode);
  }

  /**
   * Returns a new `Money` whose amount is this amount multiplied by a
   * non-negative integer quantity, rounded to two decimal places.
   *
   * Line-item subtotals (unitPrice * quantity) are the only consumer today.
   * Quantities are always whole units (you cannot order 1.5 espresso
   * machines), so non-integer or negative quantities are programmer errors
   * and we throw rather than silently coerce.
   */
  times(quantity: number): Money {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error(
        `Invalid Money.times quantity: expected non-negative integer, received ${quantity}.`,
      );
    }

    const product = parseFloat(this.amount) * quantity;
    return new Money(product.toFixed(2), this.currencyCode);
  }

  equals(other: Money): boolean {
    return (
      this.amount === other.amount && this.currencyCode === other.currencyCode
    );
  }
}
