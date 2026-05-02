import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ShopifyOAuthClient } from "./ShopifyOAuthClient";

const config = {
  clientId: "test-client-id",
  authUrl: "https://shopify.com/auth/123/oauth/authorize",
  tokenUrl: "https://shopify.com/auth/123/oauth/token",
  logoutUrl: "https://shopify.com/auth/123/logout",
};

describe("ShopifyOAuthClient", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("buildAuthorizeUrl", () => {
    it("includes client_id, redirect_uri, response_type, code_challenge, scope, state, nonce, ui_locales", async () => {
      const client = new ShopifyOAuthClient(config);
      const result = await client.buildAuthorizeUrl({
        redirectUri: "https://folka.com/cb",
        locale: "es",
      });
      const u = new URL(result.url);
      expect(u.origin + u.pathname).toBe(config.authUrl);
      expect(u.searchParams.get("client_id")).toBe("test-client-id");
      expect(u.searchParams.get("redirect_uri")).toBe("https://folka.com/cb");
      expect(u.searchParams.get("response_type")).toBe("code");
      expect(u.searchParams.get("code_challenge_method")).toBe("S256");
      expect(u.searchParams.get("code_challenge")).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(u.searchParams.get("scope")).toContain("openid");
      expect(u.searchParams.get("scope")).toContain("email");
      expect(u.searchParams.get("scope")).toContain("customer-account-api:full");
      expect(u.searchParams.get("ui_locales")).toBe("es");
      expect(u.searchParams.get("state")).toBeTruthy();
      expect(u.searchParams.get("nonce")).toBeTruthy();
      expect(result.pkceVerifier.length).toBeGreaterThanOrEqual(43);
      expect(result.state).toBe(u.searchParams.get("state"));
      expect(result.nonce).toBe(u.searchParams.get("nonce"));
    });
  });

  describe("exchangeCode", () => {
    it("posts urlencoded form to token endpoint and parses response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "at",
          refresh_token: "rt",
          id_token: "id",
          expires_in: 3600,
        }),
      });
      const client = new ShopifyOAuthClient(config);
      const result = await client.exchangeCode({
        code: "auth-code",
        pkceVerifier: "verifier",
        redirectUri: "https://folka.com/cb",
      });
      expect(result.accessToken).toBe("at");
      expect(result.refreshToken).toBe("rt");
      expect(result.idToken).toBe("id");
      const ms = result.expiresAt.getTime() - Date.now();
      expect(ms).toBeGreaterThan(3_500_000);
      expect(ms).toBeLessThan(3_700_000);

      const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
      const [calledUrl, calledOpts] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe(config.tokenUrl);
      expect(calledOpts.method).toBe("POST");
      expect(calledOpts.headers["Content-Type"]).toBe(
        "application/x-www-form-urlencoded",
      );
      const body = String(calledOpts.body);
      expect(body).toContain("grant_type=authorization_code");
      expect(body).toContain("code=auth-code");
      expect(body).toContain("code_verifier=verifier");
    });

    it("throws when token endpoint returns non-OK", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "invalid_grant",
      });
      const client = new ShopifyOAuthClient(config);
      await expect(
        client.exchangeCode({ code: "x", pkceVerifier: "v", redirectUri: "r" }),
      ).rejects.toThrow();
    });
  });

  describe("refresh", () => {
    it("posts grant_type=refresh_token and parses response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "new-at",
          refresh_token: "new-rt",
          id_token: "new-id",
          expires_in: 7200,
        }),
      });
      const client = new ShopifyOAuthClient(config);
      const result = await client.refresh("rt");
      expect(result.accessToken).toBe("new-at");
      expect(result.refreshToken).toBe("new-rt");

      const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
      const body = String(fetchMock.mock.calls[0][1].body);
      expect(body).toContain("grant_type=refresh_token");
      expect(body).toContain("refresh_token=rt");
    });

    it("throws on non-OK", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
      });
      const client = new ShopifyOAuthClient(config);
      await expect(client.refresh("rt")).rejects.toThrow();
    });
  });

  describe("revoke", () => {
    it("posts to /revoke with token and token_type_hint", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      const client = new ShopifyOAuthClient(config);
      await client.revoke("rt");
      const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
      const [calledUrl, calledOpts] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe(config.tokenUrl + "/revoke");
      const body = String(calledOpts.body);
      expect(body).toContain("token=rt");
      expect(body).toContain("token_type_hint=refresh_token");
    });

    it("swallows fetch errors so logout still proceeds", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("network"),
      );
      const client = new ShopifyOAuthClient(config);
      await expect(client.revoke("rt")).resolves.toBeUndefined();
    });
  });
});
