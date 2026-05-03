import { describe, it, expect } from "vitest";
import {
  generatePkceVerifier,
  deriveChallenge,
  generateState,
  generateNonce,
} from "./pkce";

describe("pkce", () => {
  it("generates a verifier between 43 and 128 chars", () => {
    const v = generatePkceVerifier();
    expect(v.length).toBeGreaterThanOrEqual(43);
    expect(v.length).toBeLessThanOrEqual(128);
  });

  it("verifier uses only RFC 7636 unreserved chars", () => {
    const v = generatePkceVerifier();
    expect(v).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it("two verifiers in a row are different", () => {
    expect(generatePkceVerifier()).not.toBe(generatePkceVerifier());
  });

  it("derives a base64url SHA-256 challenge", async () => {
    const v = "test-verifier-with-enough-entropy-here-12345";
    const c = await deriveChallenge(v);
    expect(c).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(c.length).toBe(43);
  });

  it("derives the same challenge for the same verifier", async () => {
    const v = "deterministic-verifier-input-string-99";
    const c1 = await deriveChallenge(v);
    const c2 = await deriveChallenge(v);
    expect(c1).toBe(c2);
  });

  it("derives different challenges for different verifiers", async () => {
    expect(await deriveChallenge("a")).not.toBe(await deriveChallenge("b"));
  });

  it("generates state and nonce as non-empty strings", () => {
    expect(generateState().length).toBeGreaterThan(0);
    expect(generateNonce().length).toBeGreaterThan(0);
    expect(generateState()).not.toBe(generateState());
  });
});
