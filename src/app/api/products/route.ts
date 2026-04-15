import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { parseShopSortParam } from "@/lib/commerce/sort";
import { ShopProductsParamsSchema } from "@/lib/api/schemas";
import { formatApiError } from "@/lib/api/error";
import { parseFilterParams } from "@/lib/commerce/filters";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const result = ShopProductsParamsSchema.safeParse({
    after: searchParams.get("after") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    first: searchParams.get("first") ?? 24,
    brand: searchParams.get("brand") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    price: searchParams.get("price") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { after, sort, country, language, first, brand, type, price } = result.data;
  const { sortKey, reverse } = parseShopSortParam(sort);
  const currency = country === "MX" ? "MXN" : "USD";
  const filters = parseFilterParams({ brand, type, price }, currency);

  try {
    const page = await commerce.getProductsPage({
      first,
      after,
      sortKey,
      reverse,
      country,
      language,
      filters,
    });

    return NextResponse.json({
      products: page.products,
      pageInfo: page.pageInfo,
    });
  } catch (error) {
    return formatApiError(error);
  }
}
