import { describe, it, expect, vi } from "vitest";
import { RefreshAccessToken } from "./RefreshAccessToken";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";
import { AuthExpiredError } from "@/domain/customer/errors";

function makeOAuth(overrides: Partial<OAuthClient> = {}): OAuthClient {
  return {
    buildAuthorizeUrl: vi.fn(),
    exchangeCode: vi.fn(),
    refresh: vi.fn(),
    revoke: vi.fn(),
    ...overrides,
  };
}

function makeSession(overrides: Partial<SessionStore> = {}): SessionStore {
  return {
    read: vi.fn(),
    write: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
    ...overrides,
  };
}

describe("RefreshAccessToken", () => {
  it("throws AuthExpiredError when the session is empty", async () => {
    const oauth = makeOAuth();
    const session = makeSession({ read: vi.fn().mockResolvedValue(null) });

    const useCase = new RefreshAccessToken(oauth, session);

    await expect(useCase.execute()).rejects.toBeInstanceOf(AuthExpiredError);
    expect(oauth.refresh).not.toHaveBeenCalled();
  });

  it("refreshes when the existing token expires within 60 seconds and persists the new tokens", async () => {
    const expiringSoon: TokenSet = {
      accessToken: "old-access",
      refreshToken: "refresh-token",
      idToken: "id",
      expiresAt: new Date(Date.now() + 30_000),
    };
    const fresh: TokenSet = {
      accessToken: "new-access",
      refreshToken: "new-refresh",
      idToken: "new-id",
      expiresAt: new Date(Date.now() + 3_600_000),
    };
    const oauth = makeOAuth({
      refresh: vi.fn().mockResolvedValue(fresh),
    });
    const session = makeSession({
      read: vi.fn().mockResolvedValue(expiringSoon),
    });

    const useCase = new RefreshAccessToken(oauth, session);
    const result = await useCase.execute();

    expect(oauth.refresh).toHaveBeenCalledWith("refresh-token");
    expect(session.write).toHaveBeenCalledWith(fresh);
    expect(result).toBe(fresh);
  });

  it("returns existing tokens unchanged when expiry is more than 60 seconds away", async () => {
    const stillFresh: TokenSet = {
      accessToken: "current-access",
      refreshToken: "current-refresh",
      idToken: "id",
      expiresAt: new Date(Date.now() + 5 * 60_000),
    };
    const oauth = makeOAuth();
    const session = makeSession({
      read: vi.fn().mockResolvedValue(stillFresh),
    });

    const useCase = new RefreshAccessToken(oauth, session);
    const result = await useCase.execute();

    expect(oauth.refresh).not.toHaveBeenCalled();
    expect(session.write).not.toHaveBeenCalled();
    expect(result).toBe(stillFresh);
  });
});
