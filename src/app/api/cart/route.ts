import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { CartActionSchema } from "@/lib/api/schemas";
import { formatApiError } from "@/lib/api/error";

export async function POST(req: Request) {
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

    switch (data.action) {
      case "create": {
        const cart = await commerce.createCart();
        return NextResponse.json(cart);
      }
      case "get": {
        const cart = await commerce.getCart(data.cartId);
        return NextResponse.json(cart);
      }
      case "add": {
        const cart = await commerce.addToCart(data.cartId, data.lines);
        return NextResponse.json(cart);
      }
      case "update": {
        const cart = await commerce.updateCart(
          data.cartId,
          data.lines.map((l) => ({
            id: l.id,
            quantity: l.quantity,
          }))
        );
        return NextResponse.json(cart);
      }
      case "remove": {
        const cart = await commerce.removeFromCart(data.cartId, data.lineIds);
        return NextResponse.json(cart);
      }
    }
  } catch (error) {
    return formatApiError(error);
  }
}
