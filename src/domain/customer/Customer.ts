import type { CustomerId } from "./CustomerId";
import type { Email } from "./Email";

/**
 * Input shape accepted by `Customer.create`.
 *
 * `id` and `email` are typed as their respective value objects so that any
 * structural validation (GID format, email shape) has already happened
 * before a `Customer` is constructed. The remaining profile fields are
 * primitives that may be `null` to signal explicit absence.
 *
 * Exported so adapter-layer mappers (Shopify Customer Account API, etc.)
 * and use cases can target this shape directly without redeclaring it.
 */
export interface CustomerInput {
  id: CustomerId;
  email: Email;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  acceptsMarketing: boolean;
}

/**
 * Partial profile patch accepted by `Customer.withProfile`.
 *
 * Each field is optional. The distinction between "key absent" and "key
 * present with value `null`" is meaningful: absent means "preserve the
 * current value", `null` means "clear this field". `id` and `email` are
 * intentionally not patchable here. Email changes are a separate flow
 * (verification required) and ids are immutable.
 */
export interface ProfileUpdate {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  acceptsMarketing?: boolean;
}

/**
 * Customer aggregate root for the customer bounded context.
 *
 * Immutable: every field is `readonly` and any state evolution returns a
 * new instance via `withProfile`. Constructed only via `Customer.create`,
 * never `new Customer`.
 *
 * Composes `CustomerId` and `Email` value objects rather than raw strings,
 * pushing format validation to the boundaries and letting this class
 * trust its inputs.
 */
export class Customer {
  private constructor(
    public readonly id: CustomerId,
    public readonly email: Email,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly phone: string | null,
    public readonly acceptsMarketing: boolean,
  ) {}

  static create(input: CustomerInput): Customer {
    return new Customer(
      input.id,
      input.email,
      input.firstName,
      input.lastName,
      input.phone,
      input.acceptsMarketing,
    );
  }

  /**
   * Human-readable label for UI surfaces (account dropdowns, greetings).
   *
   * Resolution order: full name when both parts exist, else firstName
   * alone, else the email value. Email is the last-resort fallback because
   * it is always defined on a `Customer`.
   */
  get displayName(): string {
    if (this.firstName !== null && this.lastName !== null) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName !== null) {
      return this.firstName;
    }
    return this.email.value;
  }

  /**
   * Returns a new `Customer` with the supplied profile fields applied.
   *
   * Uses `in` checks rather than `??` so that a caller passing an explicit
   * `null` (clear the field) is distinguishable from omitting the key
   * (preserve the field). This is the contract enforced by the test suite
   * and is required for partial PATCH-style updates against the Shopify
   * Customer Account API.
   */
  withProfile(update: ProfileUpdate): Customer {
    const firstName =
      "firstName" in update ? (update.firstName ?? null) : this.firstName;
    const lastName =
      "lastName" in update ? (update.lastName ?? null) : this.lastName;
    const phone = "phone" in update ? (update.phone ?? null) : this.phone;
    const acceptsMarketing =
      "acceptsMarketing" in update && update.acceptsMarketing !== undefined
        ? update.acceptsMarketing
        : this.acceptsMarketing;

    return new Customer(
      this.id,
      this.email,
      firstName,
      lastName,
      phone,
      acceptsMarketing,
    );
  }
}
