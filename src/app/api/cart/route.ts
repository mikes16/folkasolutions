import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { CartActionSchema } from "@/lib/api/schemas";
import { formatApiError } from "@/lib/api/error";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: Request) {
  const distinctId = req.headers.get("X-POSTHOG-DISTINCT-ID") ?? "anonymous";
  const sessionId = req.headers.get("X-POSTHOG-SESSION-ID") ?? undefined;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = CartActionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request", details: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const data = result.data;
    const locale = { country: data.country, language: data.language };

    switch (data.action) {
      case "create": {
        const cart = await commerce.createCart(locale);
        return NextResponse.json(cart);
      }
      case "get": {
        const cart = await commerce.getCart(data.cartId, locale);
        return NextResponse.json(cart);
      }
      case "add": {
        const cart = await commerce.addToCart(data.cartId, data.lines, locale);
        const posthog = getPostHogClient();
        posthog.capture({
          distinctId,
          event: "cart_item_added_server",
          properties: {
            cart_id: data.cartId,
            lines: data.lines,
            cart_total: cart.cost?.totalAmount?.amount,
            cart_total_currency: cart.cost?.totalAmount?.currencyCode,
            ...(sessionId && { $session_id: sessionId }),
          },
        });
        return NextResponse.json(cart);
      }
      case "update": {
        const cart = await commerce.updateCart(
          data.cartId,
          data.lines.map((l) => ({
            id: l.id,
            quantity: l.quantity,
          })),
          locale
        );
        return NextResponse.json(cart);
      }
      case "remove": {
        const cart = await commerce.removeFromCart(
          data.cartId,
          data.lineIds,
          locale
        );
        return NextResponse.json(cart);
      }
      case "updateAttributes": {
        const cart = await commerce.updateCartAttributes(
          data.cartId,
          data.attributes,
          locale
        );
        return NextResponse.json(cart);
      }
    }
  } catch (error) {
    return formatApiError(error);
  }
}
