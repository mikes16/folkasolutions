import { createHash, randomBytes } from "node:crypto";

/**
 * RFC 7636 unreserved alphabet for PKCE verifiers.
 * Includes ALPHA / DIGIT / "-" / "." / "_" / "~".
 */
const UNRESERVED_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

/**
 * Target length for generated verifiers. RFC 7636 allows 43..128;
 * 96 keeps comfortably within bounds while providing strong entropy.
 */
const VERIFIER_LENGTH = 96;

/**
 * Number of random bytes used to back state and nonce values.
 */
const STATE_NONCE_BYTES = 16;

/**
 * Base64url-encode a buffer with no padding, per RFC 7636 section 4.2.
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Generate a PKCE code verifier from the RFC 7636 unreserved alphabet.
 * Uses cryptographically strong randomness; output length is 96 chars.
 */
export function generatePkceVerifier(): string {
  const bytes = randomBytes(VERIFIER_LENGTH);
  let result = "";
  for (let i = 0; i < VERIFIER_LENGTH; i += 1) {
    result += UNRESERVED_CHARS[bytes[i] % UNRESERVED_CHARS.length];
  }
  return result;
}

/**
 * Derive a PKCE S256 code challenge: base64url(SHA-256(verifier)) without padding.
 * Async to match the OAuth port contract; the underlying hash is synchronous.
 */
export async function deriveChallenge(verifier: string): Promise<string> {
  const hash = createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash);
}

/**
 * Generate an OAuth `state` parameter as base64url-encoded random bytes.
 */
export function generateState(): string {
  return base64UrlEncode(randomBytes(STATE_NONCE_BYTES));
}

/**
 * Generate an OIDC `nonce` parameter as base64url-encoded random bytes.
 * Separate from `generateState` for call-site clarity.
 */
export function generateNonce(): string {
  return base64UrlEncode(randomBytes(STATE_NONCE_BYTES));
}
