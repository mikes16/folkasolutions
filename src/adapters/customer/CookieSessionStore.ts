import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionStore, TokenSet } from "@/application/customer/ports";

const COOKIE_NAME = "folka_session";
// Refresh-token lifetime ceiling: 30 days. The cookie's `maxAge` matches this
// so the browser drops the cookie at or before the refresh token's natural
// expiry — there is no point keeping a cookie alive past that point.
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * Compact JWT payload schema. Property names are intentionally short because
 * they ride inside the cookie verbatim and every byte counts against the
 * 4 KB cookie size budget.
 */
interface SessionPayload {
  /** accessToken */
  at: string;
  /** refreshToken */
  rt: string;
  /** idToken */
  id: string;
  /** expiresAt as Unix ms timestamp (independent of the JWT's own `exp`) */
  exp_at: number;
}

/**
 * Adapter that persists the OAuth `TokenSet` in an HTTP-only cookie. The
 * cookie value is a JWT signed with HS256 so a tampered cookie is rejected
 * on read, and the secret never leaves the server.
 */
export class CookieSessionStore implements SessionStore {
  private readonly secret: Uint8Array;

  constructor(rawSecret: string) {
    if (rawSecret.length < 32) {
      throw new Error("Session secret must be at least 32 chars");
    }
    this.secret = new TextEncoder().encode(rawSecret);
  }

  async read(): Promise<TokenSet | null> {
    const store = await cookies();
    const cookie = store.get(COOKIE_NAME);
    if (!cookie) return null;
    try {
      const { payload } = await jwtVerify(cookie.value, this.secret);
      // Defensive shape check — never trust the parsed payload's type alone,
      // since the JWT could have been signed by us but with a different schema.
      if (
        typeof payload !== "object" ||
        payload === null ||
        typeof (payload as Record<string, unknown>).at !== "string" ||
        typeof (payload as Record<string, unknown>).rt !== "string" ||
        typeof (payload as Record<string, unknown>).id !== "string" ||
        typeof (payload as Record<string, unknown>).exp_at !== "number"
      ) {
        return null;
      }
      const p = payload as unknown as SessionPayload;
      return {
        accessToken: p.at,
        refreshToken: p.rt,
        idToken: p.id,
        expiresAt: new Date(p.exp_at),
      };
    } catch {
      // Includes signature mismatch, expired JWT, malformed token.
      return null;
    }
  }

  async write(tokens: TokenSet): Promise<void> {
    const payload: SessionPayload = {
      at: tokens.accessToken,
      rt: tokens.refreshToken,
      id: tokens.idToken,
      exp_at: tokens.expiresAt.getTime(),
    };
    const jwt = await new SignJWT(
      payload as unknown as Record<string, unknown>,
    )
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(this.secret);

    const store = await cookies();
    store.set(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
  }

  async clear(): Promise<void> {
    const store = await cookies();
    store.delete(COOKIE_NAME);
  }
}
