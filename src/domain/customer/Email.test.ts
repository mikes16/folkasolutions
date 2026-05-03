import { describe, it, expect } from "vitest";
import { Email } from "./Email";
import { InvalidEmailError } from "./errors";

describe("Email", () => {
  it("accepts a valid address", () => {
    const email = Email.from("hola@folkasolutions.com");
    expect(email.value).toBe("hola@folkasolutions.com");
  });

  it("normalizes by trimming and lowercasing", () => {
    const email = Email.from("  HOLA@FOLKASOLUTIONS.COM  ");
    expect(email.value).toBe("hola@folkasolutions.com");
  });

  it("rejects strings without @", () => {
    expect(() => Email.from("not-an-email")).toThrow(InvalidEmailError);
  });

  it("rejects empty string", () => {
    expect(() => Email.from("")).toThrow(InvalidEmailError);
  });

  it("rejects strings without a TLD", () => {
    expect(() => Email.from("user@host")).toThrow(InvalidEmailError);
  });

  it("rejects strings with whitespace inside", () => {
    expect(() => Email.from("foo bar@host.com")).toThrow(InvalidEmailError);
  });

  it("considers two Emails equal when their normalized values match", () => {
    const a = Email.from("hola@folka.com");
    const b = Email.from("HOLA@folka.com");
    expect(a.equals(b)).toBe(true);
  });

  it("considers two different Emails not equal", () => {
    const a = Email.from("a@folka.com");
    const b = Email.from("b@folka.com");
    expect(a.equals(b)).toBe(false);
  });
});
