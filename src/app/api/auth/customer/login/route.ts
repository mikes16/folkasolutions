import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeContainer } from "@/infrastructure/customer/container";

const PKCE_COOKIE = "folka_pkce";
const STATE_COOKIE = "folka_state";
// Only needs to survive the auth round trip.
const ROUNDTRIP_MAX_AGE = 600;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") ?? "es";
  const redirectUri = `${url.origin}/api/auth/customer/callback`;

  const { login } = makeContainer();
  const auth = await login.execute({ redirectUri, locale });

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ROUNDTRIP_MAX_AGE,
  };
  cookieStore.set(PKCE_COOKIE, auth.pkceVerifier, cookieOpts);
  cookieStore.set(STATE_COOKIE, auth.state, cookieOpts);

  return NextResponse.redirect(auth.url, 302);
}
