import { describe, it, expect } from "vitest";
import { Customer } from "./Customer";
import { CustomerId } from "./CustomerId";
import { Email } from "./Email";

describe("Customer", () => {
  const baseInput = {
    id: CustomerId.from("gid://shopify/Customer/1"),
    email: Email.from("miguel@folka.com"),
    firstName: "Miguel" as string | null,
    lastName: "López" as string | null,
    phone: "+528112345678" as string | null,
    acceptsMarketing: false,
  };

  it("constructs with required fields", () => {
    const c = Customer.create(baseInput);
    expect(c.email.value).toBe("miguel@folka.com");
    expect(c.firstName).toBe("Miguel");
    expect(c.lastName).toBe("López");
    expect(c.phone).toBe("+528112345678");
    expect(c.acceptsMarketing).toBe(false);
  });

  it("computes display name from first + last", () => {
    const c = Customer.create(baseInput);
    expect(c.displayName).toBe("Miguel López");
  });

  it("falls back to firstName alone when lastName missing", () => {
    const c = Customer.create({ ...baseInput, lastName: null });
    expect(c.displayName).toBe("Miguel");
  });

  it("falls back to email when both names missing", () => {
    const c = Customer.create({ ...baseInput, firstName: null, lastName: null });
    expect(c.displayName).toBe("miguel@folka.com");
  });

  it("withProfile returns a NEW customer with updated fields", () => {
    const c = Customer.create(baseInput);
    const updated = c.withProfile({ firstName: "Mike", lastName: "Lopez" });
    expect(updated.firstName).toBe("Mike");
    expect(updated.lastName).toBe("Lopez");
  });

  it("withProfile leaves the original untouched", () => {
    const c = Customer.create(baseInput);
    c.withProfile({ firstName: "Mike" });
    expect(c.firstName).toBe("Miguel"); // original unchanged
  });

  it("withProfile preserves fields not in the update", () => {
    const c = Customer.create(baseInput);
    const updated = c.withProfile({ firstName: "Mike" });
    expect(updated.lastName).toBe("López"); // preserved
    expect(updated.email.value).toBe("miguel@folka.com"); // preserved
    expect(updated.id.value).toBe("gid://shopify/Customer/1"); // preserved
  });

  it("withProfile can null out fields explicitly", () => {
    const c = Customer.create(baseInput);
    const updated = c.withProfile({ phone: null });
    expect(updated.phone).toBeNull();
  });
});
