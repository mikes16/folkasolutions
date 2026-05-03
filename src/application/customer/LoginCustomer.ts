import type { OAuthAuthorizeUrl, OAuthClient } from "./ports";

/**
 * Use case: start the customer OAuth login flow.
 *
 * Delegates to the `OAuthClient` port to build an authorize URL plus the
 * PKCE/state/nonce trio that must be persisted alongside the pending
 * session. The route handler is responsible for storing those values and
 * redirecting the browser to `url`.
 */
export class LoginCustomer {
  constructor(private readonly oauth: OAuthClient) {}

  async execute(args: {
    redirectUri: string;
    locale: string;
  }): Promise<OAuthAuthorizeUrl> {
    return this.oauth.buildAuthorizeUrl(args);
  }
}
