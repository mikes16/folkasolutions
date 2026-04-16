import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { parseSortParam } from "@/lib/commerce/sort";
import { CollectionProductsParamsSchema } from "@/lib/api/schemas";
import { formatApiError } from "@/lib/api/error";
import { parseFilterParams } from "@/lib/commerce/filters";
import { isProductOnSale, isSaleCollectionHandle } from "@/lib/commerce/sale";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = new URL(req.url);

  const result = CollectionProductsParamsSchema.safeParse({
    after: searchParams.get("after") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    first: searchParams.get("first") ?? 40,
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
  const { sortKey, reverse } = parseSortParam(sort);
  const currency = country === "MX" ? "MXN" : "USD";
  const filters = parseFilterParams({ brand, type, price }, currency);

  try {
    const collection = await commerce.getCollection(handle, {
      first,
      after,
      sortKey,
      reverse,
      country,
      language,
      filters,
    });

    if (!collection) {
      return NextResponse.json(
        { products: [], pageInfo: null },
        { status: 404 }
      );
    }

    const products = isSaleCollectionHandle(handle)
      ? collection.products.filter(isProductOnSale)
      : collection.products;

    return NextResponse.json({
      products,
      pageInfo: collection.pageInfo,
    });
  } catch (error) {
    return formatApiError(error);
  }
}
