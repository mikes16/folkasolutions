import { InvalidEmailError } from "./errors";

/**
 * Validates a normalized (already trimmed + lowercased) email candidate.
 *
 * Intentionally minimal: we only enforce the shape the tests require
 * (no whitespace, exactly one `@`, a `.` after the `@`, and non-empty
 * local/domain segments). Keeping the regex narrow lets the domain layer
 * stay free of an "email-validator" dependency. Stricter checks (MX
 * records, plus-addressing rules) belong in the infrastructure layer if
 * ever needed.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email address as a domain value object.
 *
 * Always normalized (trimmed, lowercased) and guaranteed to match
 * `EMAIL_PATTERN`. Constructed only via `Email.from`, never `new Email`.
 */
export class Email {
  private constructor(public readonly value: string) {}

  static from(raw: string): Email {
    const normalized = raw.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailError();
    }

    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
