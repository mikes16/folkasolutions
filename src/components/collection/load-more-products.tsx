"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import type { Product, PageInfo } from "@/lib/commerce/types";

interface LoadMoreProductsProps {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
  collectionHandle: string;
  sort: string;
  country?: string;
  language?: string;
  brand?: string;
  type?: string;
  price?: string;
}

export function LoadMoreProducts({
  initialProducts,
  initialPageInfo,
  collectionHandle,
  sort,
  country,
  language,
  brand,
  type,
  price,
}: LoadMoreProductsProps) {
  const t = useTranslations("collections");
  const [products, setProducts] = useState(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!pageInfo.endCursor) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        after: pageInfo.endCursor,
        ...(sort && { sort }),
        ...(country && { country }),
        ...(language && { language }),
        ...(brand && { brand }),
        ...(type && { type }),
        ...(price && { price }),
      });

      const res = await fetch(
        `/api/collections/${collectionHandle}/products?${params}`
      );
      const data = await res.json();

      if (data.products) {
        setProducts((prev) => [...prev, ...data.products]);
        setPageInfo(data.pageInfo);
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setIsLoading(false);
    }
  }, [pageInfo.endCursor, sort, country, language, brand, type, price, collectionHandle]);

  return (
    <>
      <p className="text-[11px] uppercase tracking-[2px] text-muted mb-6">
        {t("showingCount", { count: products.length })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {pageInfo.hasNextPage && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}
