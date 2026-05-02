import { describe, it, expect, vi } from "vitest";
import { LogoutCustomer } from "./LogoutCustomer";
import type { OAuthClient, SessionStore, TokenSet } from "./ports";

function makeOAuth(overrides: Partial<OAuthClient> = {}): OAuthClient {
  return {
    buildAuthorizeUrl: vi.fn(),
    exchangeCode: vi.fn(),
    refresh: vi.fn(),
    revoke: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeSession(overrides: Partial<SessionStore> = {}): SessionStore {
  return {
    read: vi.fn(),
    write: vi.fn(),
    clear: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("LogoutCustomer", () => {
  it("revokes the refresh token and clears the session when tokens exist", async () => {
    const tokens: TokenSet = {
      accessToken: "access",
      refreshToken: "refresh-token",
      idToken: "id",
      expiresAt: new Date(Date.now() + 60_000),
    };
    const oauth = makeOAuth();
    const session = makeSession({
      read: vi.fn().mockResolvedValue(tokens),
    });

    const useCase = new LogoutCustomer(oauth, session);
    await useCase.execute();

    expect(oauth.revoke).toHaveBeenCalledWith("refresh-token");
    expect(session.clear).toHaveBeenCalledTimes(1);
  });

  it("clears the session without calling revoke when there is no session", async () => {
    const oauth = makeOAuth();
    const session = makeSession({
      read: vi.fn().mockResolvedValue(null),
    });

    const useCase = new LogoutCustomer(oauth, session);
    await useCase.execute();

    expect(oauth.revoke).not.toHaveBeenCalled();
    expect(session.clear).toHaveBeenCalledTimes(1);
  });

  it("still clears the session when revoke throws", async () => {
    const tokens: TokenSet = {
      accessToken: "access",
      refreshToken: "refresh-token",
      idToken: "id",
      expiresAt: new Date(Date.now() + 60_000),
    };
    const oauth = makeOAuth({
      revoke: vi.fn().mockRejectedValue(new Error("network down")),
    });
    const session = makeSession({
      read: vi.fn().mockResolvedValue(tokens),
    });

    const useCase = new LogoutCustomer(oauth, session);

    await expect(useCase.execute()).resolves.toBeUndefined();
    expect(oauth.revoke).toHaveBeenCalledWith("refresh-token");
    expect(session.clear).toHaveBeenCalledTimes(1);
  });
});
