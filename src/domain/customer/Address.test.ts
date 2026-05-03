import { describe, it, expect } from "vitest";
import { Address } from "./Address";

describe("Address", () => {
  it("constructs from required fields", () => {
    const addr = Address.create({
      firstName: "Miguel",
      lastName: "López",
      address1: "Av. Eugenio Garza Sada 6518",
      city: "Monterrey",
      countryCode: "MX",
      zip: "64960",
      provinceCode: "NLE",
      phone: "+528112345678",
    });
    expect(addr.address1).toBe("Av. Eugenio Garza Sada 6518");
    expect(addr.countryCode).toBe("MX");
    expect(addr.phone).toBe("+528112345678");
  });

  it("defaults optional fields to null", () => {
    const addr = Address.create({
      firstName: "Miguel",
      lastName: "López",
      address1: "Av. Eugenio Garza Sada 6518",
      city: "Monterrey",
      countryCode: "MX",
      zip: "64960",
      provinceCode: "NLE",
    });
    expect(addr.company).toBeNull();
    expect(addr.address2).toBeNull();
    expect(addr.phone).toBeNull();
  });

  it("formats a single-line representation for display", () => {
    const addr = Address.create({
      firstName: "Miguel",
      lastName: "López",
      address1: "Av. Eugenio Garza Sada 6518",
      city: "Monterrey",
      countryCode: "MX",
      zip: "64960",
      provinceCode: "NLE",
    });
    expect(addr.formatSingleLine()).toBe(
      "Av. Eugenio Garza Sada 6518, Monterrey, NLE 64960, MX",
    );
  });

  it("includes apartment line when present", () => {
    const addr = Address.create({
      firstName: "Miguel",
      lastName: "López",
      address1: "Av. Eugenio Garza Sada 6518",
      address2: "Depto 401",
      city: "Monterrey",
      countryCode: "MX",
      zip: "64960",
      provinceCode: "NLE",
    });
    expect(addr.formatSingleLine()).toContain("Depto 401");
  });

  it("rejects empty required fields", () => {
    expect(() =>
      Address.create({
        firstName: "",
        lastName: "López",
        address1: "Av. Eugenio Garza Sada 6518",
        city: "Monterrey",
        countryCode: "MX",
        zip: "64960",
        provinceCode: "NLE",
      }),
    ).toThrow();
  });
});
