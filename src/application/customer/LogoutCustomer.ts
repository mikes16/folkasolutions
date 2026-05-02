import type { OAuthClient, SessionStore } from "./ports";

/**
 * Use case: log the customer out.
 *
 * Best-effort revoke of the refresh token (we still want the local
 * session cleared even if Shopify's revoke endpoint is unreachable),
 * followed by an unconditional `session.clear()`. The user-facing
 * outcome is always "you are now logged out", so a transient failure
 * upstream must not leave stale tokens on the device.
 */
export class LogoutCustomer {
  constructor(
    private readonly oauth: OAuthClient,
    private readonly session: SessionStore,
  ) {}

  async execute(): Promise<void> {
    const current = await this.session.read();
    if (current !== null) {
      try {
        await this.oauth.revoke(current.refreshToken);
      } catch {
        // Swallow: revoke is best-effort. The session is cleared below
        // regardless, so the customer is logged out locally even if
        // Shopify never registered the revocation.
      }
    }
    await this.session.clear();
  }
}
