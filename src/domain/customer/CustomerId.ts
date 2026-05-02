/**
 * Validates a Shopify Customer GID.
 *
 * Shopify identifiers in the Storefront / Customer Account APIs are
 * Globally-unique IDs of the form `gid://shopify/<Resource>/<numeric-id>`.
 * For the customer bounded context we only accept the `Customer` resource,
 * with a strictly numeric id segment. Anchoring with `^` and `$` prevents
 * accidental matches on URLs or arbitrary strings that happen to contain a
 * GID-shaped substring.
 */
const CUSTOMER_GID_PATTERN = /^gid:\/\/shopify\/Customer\/\d+$/;

/**
 * Customer identifier as a domain value object.
 *
 * Wraps the Shopify GID format `gid://shopify/Customer/<digits>` and
 * guarantees that any constructed instance has already been validated.
 * Constructed only via `CustomerId.from`, never `new CustomerId`.
 *
 * The validation rule here is structural (a wire-format check), not a
 * business rule, so this throws a plain `Error` rather than carrying a
 * dedicated domain error class.
 */
export class CustomerId {
  private constructor(public readonly value: string) {}

  static from(raw: string): CustomerId {
    if (!CUSTOMER_GID_PATTERN.test(raw)) {
      throw new Error(
        `Invalid Shopify Customer GID: expected "gid://shopify/Customer/<digits>", received ${JSON.stringify(raw)}.`,
      );
    }

    return new CustomerId(raw);
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value;
  }
}
