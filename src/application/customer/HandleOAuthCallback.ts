import type { OAuthClient, SessionStore, TokenSet } from "./ports";

/**
 * Use case: complete the OAuth code-for-token exchange and persist the
 * resulting session.
 *
 * The route handler is responsible for validating `state` and resolving
 * the matching `pkceVerifier` before invoking this use case. Here we only
 * exchange the code, write the tokens to the session store, and return
 * them so the caller can chain follow-up actions (e.g. fetching the
 * profile to seed the account UI).
 */
export class HandleOAuthCallback {
  constructor(
    private readonly oauth: OAuthClient,
    private readonly session: SessionStore,
  ) {}

  async execute(args: {
    code: string;
    pkceVerifier: string;
    redirectUri: string;
  }): Promise<TokenSet> {
    const tokens = await this.oauth.exchangeCode(args);
    await this.session.write(tokens);
    return tokens;
  }
}
