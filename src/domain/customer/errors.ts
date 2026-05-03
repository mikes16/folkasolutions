/**
 * Domain errors for the customer bounded context.
 *
 * Each error carries a stable `code` (SCREAMING_SNAKE_CASE) so adapters can
 * map them to HTTP responses, telemetry events, or i18n strings without
 * inspecting the message. Messages are for developers; user-facing copy
 * lives in the interface layer.
 *
 * To add a new error: extend `CustomerDomainError`, set a unique `code`,
 * and provide a meaningful default message.
 */

/** Base class so future code can `instanceof` check the whole family. */
export abstract class CustomerDomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidEmailError extends CustomerDomainError {
  readonly code = "INVALID_EMAIL" as const;

  constructor(message = "The provided value is not a valid email address.") {
    super(message);
  }
}

export class CustomerNotFoundError extends CustomerDomainError {
  readonly code = "CUSTOMER_NOT_FOUND" as const;

  constructor(message = "No customer was found for the given identifier.") {
    super(message);
  }
}

export class AuthExpiredError extends CustomerDomainError {
  readonly code = "AUTH_EXPIRED" as const;

  constructor(message = "The authentication session has expired.") {
    super(message);
  }
}

export class AuthRequiredError extends CustomerDomainError {
  readonly code = "AUTH_REQUIRED" as const;

  constructor(message = "Authentication is required to perform this action.") {
    super(message);
  }
}
