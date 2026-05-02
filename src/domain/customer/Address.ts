/**
 * Input shape accepted by `Address.create`.
 *
 * Required fields are non-empty strings. Optional fields (`company`,
 * `address2`, `phone`) may be omitted, `null`, or `undefined`; the value
 * object normalizes any of those forms to `null` so consumers see a single
 * absent representation.
 *
 * Exported so adapter-layer mappers (Shopify, etc.) can target this shape
 * directly without redeclaring the contract.
 */
export interface AddressInput {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  countryCode: string;
  zip: string;
  provinceCode: string;
  company?: string | null;
  address2?: string | null;
  phone?: string | null;
}

/**
 * Required-field keys, used by the validation loop. Kept as a `const`
 * tuple so the type system can verify each entry corresponds to a real
 * `AddressInput` member.
 */
const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "address1",
  "city",
  "countryCode",
  "zip",
  "provinceCode",
] as const satisfies ReadonlyArray<keyof AddressInput>;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

/**
 * Normalizes an optional input to `null` when blank or absent, otherwise
 * returns the trimmed value. Centralizing this keeps the constructor body
 * focused on assignment rather than coercion.
 */
function normalizeOptional(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Postal address as a domain value object.
 *
 * Constructed only via `Address.create`, never `new Address`. All fields
 * are readonly. Required fields are guaranteed to be non-empty trimmed
 * strings; optional fields are either non-empty trimmed strings or `null`.
 *
 * Validation throws a plain `Error` with a descriptive message because the
 * rule here is structural (non-empty strings), not a domain invariant rich
 * enough to warrant a dedicated error class.
 *
 * Equality is intentionally not implemented: two addresses being "the
 * same" is non-trivial (case, whitespace, abbreviations, formatting) and
 * we do not need it yet (YAGNI).
 */
export class Address {
  private constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly address1: string,
    public readonly city: string,
    public readonly countryCode: string,
    public readonly zip: string,
    public readonly provinceCode: string,
    public readonly company: string | null,
    public readonly address2: string | null,
    public readonly phone: string | null,
  ) {}

  static create(input: AddressInput): Address {
    const trimmed: Record<RequiredField, string> = {
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      countryCode: "",
      zip: "",
      provinceCode: "",
    };

    for (const field of REQUIRED_FIELDS) {
      const value = input[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`Address.${field} cannot be empty.`);
      }
      trimmed[field] = value.trim();
    }

    return new Address(
      trimmed.firstName,
      trimmed.lastName,
      trimmed.address1,
      trimmed.city,
      trimmed.countryCode,
      trimmed.zip,
      trimmed.provinceCode,
      normalizeOptional(input.company),
      normalizeOptional(input.address2),
      normalizeOptional(input.phone),
    );
  }

  /**
   * Comma-separated single-line representation suitable for inline display
   * (order summary lines, account dropdowns). Skips `address2` when null.
   *
   * Format: `address1, [address2, ]city, provinceCode zip, countryCode`
   */
  formatSingleLine(): string {
    const parts: string[] = [this.address1];
    if (this.address2 !== null) parts.push(this.address2);
    parts.push(`${this.city}, ${this.provinceCode} ${this.zip}`);
    parts.push(this.countryCode);
    return parts.join(", ");
  }
}
