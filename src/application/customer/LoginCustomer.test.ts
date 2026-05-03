import { describe, it, expect, vi } from "vitest";
import { LoginCustomer } from "./LoginCustomer";
import type { OAuthClient, OAuthAuthorizeUrl } from "./ports";

describe("LoginCustomer", () => {
  it("returns the OAuth authorize URL from the client", async () => {
    const expected: OAuthAuthorizeUrl = {
      url: "https://shopify.com/auth/123/oauth/authorize?client_id=abc",
      pkceVerifier: "verifier",
      state: "state",
      nonce: "nonce",
    };
    const client: OAuthClient = {
      buildAuthorizeUrl: vi.fn().mockResolvedValue(expected),
      exchangeCode: vi.fn(),
      refresh: vi.fn(),
      revoke: vi.fn(),
    };

    const useCase = new LoginCustomer(client);
    const result = await useCase.execute({
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
      locale: "es",
    });

    expect(result).toBe(expected);
    expect(client.buildAuthorizeUrl).toHaveBeenCalledWith({
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
      locale: "es",
    });
  });
});
