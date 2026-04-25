"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { localeCountryMap, type Locale } from "@/i18n/config";
import type { Product } from "@/lib/commerce/types";
import posthog from "posthog-js";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { country, language } = localeCountryMap[locale] ?? localeCountryMap.es;

  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
    performSearch(initialQuery);
  }, [initialQuery]);

  async function performSearch(q: string) {
    if (!q.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({
        q,
        country,
        language,
      });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      const products: Product[] = data.products || [];
      setResults(products);
      posthog.capture("search_performed", {
        query: q,
        results_count: products.length,
        has_results: products.length > 0,
        locale,
      });
    } catch (error) {
      posthog.captureException(error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch(query);
    window.history.replaceState(null, "", `?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="container-page py-12">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">
            {t("common.search")}
          </label>
          <Icon
            name="search"
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search") + "..."}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-full border border-border text-base focus:outline-none focus:border-foreground transition-colors"
            autoFocus
          />
        </div>
      </form>

      {/* Results */}
      <div aria-live="polite">
      {isLoading ? (
        <p className="text-center text-muted py-20">{t("search.searching")}</p>
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          eyebrow={t("emptyState.searchEyebrow")}
          title={t("emptyState.searchTitle", { query })}
          description={t("emptyState.searchDescription")}
          ctaHref="/shop"
          ctaText={t("emptyState.browseCatalog")}
        />
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-muted mb-6">
            {t("search.resultsCount", { count: results.length, query })}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
