import { describe, it, expect, vi, beforeEach } from "vitest";

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
}

type SetArgs =
  | [name: string, value: string, options?: CookieOptions]
  | [obj: { name: string; value: string } & CookieOptions];

const cookies = new Map<string, string>();
const cookieStore = {
  get: vi.fn((name: string) => {
    const v = cookies.get(name);
    return v === undefined ? undefined : { name, value: v };
  }),
  set: vi.fn((...args: SetArgs) => {
    const first = args[0];
    if (typeof first === "string") {
      cookies.set(first, args[1] as string);
    } else {
      cookies.set(first.name, first.value);
    }
  }),
  delete: vi.fn((name: string) => {
    cookies.delete(name);
  }),
};

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
}));

import { CookieSessionStore } from "./CookieSessionStore";
import type { TokenSet } from "@/application/customer/ports";

describe("CookieSessionStore", () => {
  const SECRET = "x".repeat(32);

  beforeEach(() => {
    cookies.clear();
    vi.clearAllMocks();
  });

  it("rejects construction with short secret", () => {
    expect(() => new CookieSessionStore("short")).toThrow();
  });

  it("returns null when no cookie is present", async () => {
    const store = new CookieSessionStore(SECRET);
    expect(await store.read()).toBeNull();
  });

  it("write then read returns the same token set", async () => {
    const tokens: TokenSet = {
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date("2026-12-01T00:00:00Z"),
    };
    const store = new CookieSessionStore(SECRET);
    await store.write(tokens);
    const read = await store.read();
    expect(read).not.toBeNull();
    expect(read!.accessToken).toBe("at");
    expect(read!.refreshToken).toBe("rt");
    expect(read!.idToken).toBe("id");
    expect(read!.expiresAt.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("rejects a tampered cookie", async () => {
    const store = new CookieSessionStore(SECRET);
    cookies.set("folka_session", "header.tampered.signature");
    expect(await store.read()).toBeNull();
  });

  it("rejects a cookie signed by a different secret", async () => {
    const otherStore = new CookieSessionStore("y".repeat(32));
    await otherStore.write({
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(),
    });
    const store = new CookieSessionStore(SECRET);
    expect(await store.read()).toBeNull();
  });

  it("clear removes the cookie", async () => {
    const store = new CookieSessionStore(SECRET);
    await store.write({
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(),
    });
    await store.clear();
    expect(cookieStore.delete).toHaveBeenCalledWith("folka_session");
  });

  it("write sets the cookie with expected security attributes", async () => {
    const store = new CookieSessionStore(SECRET);
    await store.write({
      accessToken: "at",
      refreshToken: "rt",
      idToken: "id",
      expiresAt: new Date(),
    });
    expect(cookieStore.set).toHaveBeenCalled();
    const args = cookieStore.set.mock.calls[0] as SetArgs;
    const first = args[0];
    const opts: CookieOptions =
      typeof first === "string"
        ? ((args as [string, string, CookieOptions?])[2] ?? {})
        : first;
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
    expect(opts.path).toBe("/");
    expect(opts.maxAge).toBe(30 * 24 * 60 * 60);
  });
});
