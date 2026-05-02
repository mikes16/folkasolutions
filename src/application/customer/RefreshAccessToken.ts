import { AuthExpiredError } from "@/domain/customer/errors";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

/**
 * Window before `expiresAt` within which we proactively refresh.
 *
 * One minute is long enough to absorb clock skew between the client and
 * Shopify, and short enough to avoid burning through refresh tokens on
 * every request.
 */
const REFRESH_THRESHOLD_MS = 60_000;

/**
 * Use case: ensure the caller has a usable access token, refreshing if it
 * is about to expire.
 *
 * Behavior:
 * - No session present → `AuthExpiredError` so the caller can redirect
 *   to login.
 * - Session present and the access token expires within the threshold →
 *   exchange the refresh token for a new `TokenSet`, persist it, and
 *   return it.
 * - Session present and the access token is still comfortably fresh →
 *   return it as-is so we avoid a needless network round-trip.
 */
export class RefreshAccessToken {
  constructor(
    private readonly oauth: OAuthClient,
    private readonly session: SessionStore,
  ) {}

  async execute(): Promise<TokenSet> {
    const current = await this.session.read();
    if (current === null) {
      throw new AuthExpiredError();
    }

    const msUntilExpiry = current.expiresAt.getTime() - Date.now();
    if (msUntilExpiry > REFRESH_THRESHOLD_MS) {
      return current;
    }

    const refreshed = await this.oauth.refresh(current.refreshToken);
    await this.session.write(refreshed);
    return refreshed;
  }
}
