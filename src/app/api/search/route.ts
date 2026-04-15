import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { SearchParamsSchema } from "@/lib/api/schemas";
import { formatApiError } from "@/lib/api/error";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const result = SearchParamsSchema.safeParse({
    q: searchParams.get("q") ?? "",
    country: searchParams.get("country") ?? undefined,
    language: searchParams.get("language") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { q, country, language } = result.data;

  if (!q.trim()) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await commerce.search(q, { first: 40, country, language });
    return NextResponse.json({ products });
  } catch (error) {
    return formatApiError(error);
  }
}
