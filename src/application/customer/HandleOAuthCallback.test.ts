import { describe, it, expect, vi } from "vitest";
import { HandleOAuthCallback } from "./HandleOAuthCallback";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

describe("HandleOAuthCallback", () => {
  it("exchanges the code, persists the tokens, and returns them", async () => {
    const tokens: TokenSet = {
      accessToken: "access",
      refreshToken: "refresh",
      idToken: "id",
      expiresAt: new Date("2030-01-01T00:00:00Z"),
    };
    const oauth: OAuthClient = {
      buildAuthorizeUrl: vi.fn(),
      exchangeCode: vi.fn().mockResolvedValue(tokens),
      refresh: vi.fn(),
      revoke: vi.fn(),
    };
    const session: SessionStore = {
      read: vi.fn(),
      write: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };

    const useCase = new HandleOAuthCallback(oauth, session);
    const result = await useCase.execute({
      code: "auth-code",
      pkceVerifier: "verifier",
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
    });

    expect(oauth.exchangeCode).toHaveBeenCalledWith({
      code: "auth-code",
      pkceVerifier: "verifier",
      redirectUri: "https://folkasolutions.com/api/auth/customer/callback",
    });
    expect(session.write).toHaveBeenCalledWith(tokens);
    expect(result).toBe(tokens);
  });
});
