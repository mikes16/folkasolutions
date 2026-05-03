import type {
  OAuthAuthorizeUrl,
  OAuthClient,
  TokenSet,
} from "@/application/customer/ports";
import {
  deriveChallenge,
  generateNonce,
  generatePkceVerifier,
  generateState,
} from "@/infrastructure/customer/pkce";

/**
 * Configuration required to talk to Shopify's Customer Account API OAuth endpoints.
 * `logoutUrl` is stored alongside the others for downstream consumers (logout route);
 * this class itself does not call it.
 */
export interface ShopifyOAuthClientConfig {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  logoutUrl: string;
}

/**
 * OAuth scopes requested for every Customer Account API session.
 */
const SCOPES: readonly string[] = [
  "openid",
  "email",
  "customer-account-api:full",
];

/**
 * Shape of the JSON token response returned by Shopify's `/oauth/token` endpoint
 * for both `authorization_code` and `refresh_token` grants.
 */
interface TokenResponseBody {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
}

/**
 * Adapter for Shopify's Customer Account API OAuth flow.
 *
 * Implements the application-layer `OAuthClient` port so use cases can drive
 * login, callback, refresh, and logout without depending on Shopify specifics.
 */
export class ShopifyOAuthClient implements OAuthClient {
  private readonly clientId: string;
  private readonly authUrl: string;
  private readonly tokenUrl: string;
  // Stored for parity with the config and external consumers; unused here.
  private readonly logoutUrl: string;

  constructor(config: ShopifyOAuthClientConfig) {
    this.clientId = config.clientId;
    this.authUrl = config.authUrl;
    this.tokenUrl = config.tokenUrl;
    this.logoutUrl = config.logoutUrl;
  }

  async buildAuthorizeUrl(args: {
    redirectUri: string;
    locale: string;
  }): Promise<OAuthAuthorizeUrl> {
    const pkceVerifier = generatePkceVerifier();
    const codeChallenge = await deriveChallenge(pkceVerifier);
    const state = generateState();
    const nonce = generateNonce();

    const url = new URL(this.authUrl);
    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("redirect_uri", args.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", SCOPES.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("ui_locales", args.locale);

    return {
      url: url.toString(),
      pkceVerifier,
      state,
      nonce,
    };
  }

  async exchangeCode(args: {
    code: string;
    pkceVerifier: string;
    redirectUri: string;
  }): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.clientId,
      redirect_uri: args.redirectUri,
      code: args.code,
      code_verifier: args.pkceVerifier,
    });
    return this.postTokenRequest(this.tokenUrl, body, "exchangeCode");
  }

  async refresh(refreshToken: string): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.clientId,
      refresh_token: refreshToken,
    });
    return this.postTokenRequest(this.tokenUrl, body, "refresh");
  }

  async revoke(refreshToken: string): Promise<void> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      token: refreshToken,
      token_type_hint: "refresh_token",
    });
    // Best-effort: a failed revoke must not block the user-facing logout flow.
    await fetch(`${this.tokenUrl}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }).catch(() => {});
  }

  private async postTokenRequest(
    url: string,
    body: URLSearchParams,
    operation: string,
  ): Promise<TokenSet> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const detail = await safeReadText(response);
      throw new Error(
        `ShopifyOAuthClient.${operation} failed: ${response.status}${detail ? ` ${detail}` : ""}`,
      );
    }

    const data = (await response.json()) as TokenResponseBody;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }
}

/**
 * Read a Response body as text without throwing if the body is unavailable.
 * Used to enrich error messages when token requests fail.
 */
async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
