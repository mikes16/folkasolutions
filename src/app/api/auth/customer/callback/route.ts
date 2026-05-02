import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeContainer } from "@/infrastructure/customer/container";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateFromUrl = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Default to /es if no locale hint. Could be improved later by sniffing Accept-Language.
  const failureRedirect = (reason: string) =>
    NextResponse.redirect(
      `${url.origin}/es/account/login?error=${encodeURIComponent(reason)}`,
      302,
    );

  if (error) {
    return failureRedirect(error);
  }
  if (!code || !stateFromUrl) {
    return failureRedirect("missing_params");
  }

  const cookieStore = await cookies();
  const verifier = cookieStore.get("folka_pkce")?.value;
  const expectedState = cookieStore.get("folka_state")?.value;
  if (!verifier || !expectedState) {
    return failureRedirect("session_expired");
  }
  if (expectedState !== stateFromUrl) {
    return failureRedirect("state_mismatch");
  }

  const { handleCallback } = makeContainer();
  try {
    await handleCallback.execute({
      code,
      pkceVerifier: verifier,
      redirectUri: `${url.origin}/api/auth/customer/callback`,
    });
  } catch {
    return failureRedirect("token_exchange_failed");
  }

  // Clean up the round-trip cookies.
  cookieStore.delete("folka_pkce");
  cookieStore.delete("folka_state");

  return NextResponse.redirect(`${url.origin}/es/account`, 302);
}
