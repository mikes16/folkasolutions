"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface ProductViewedTrackerProps {
  productId: string;
  productTitle: string;
  vendor: string;
  price: string;
  currency: string;
  availableForSale: boolean;
}

export function ProductViewedTracker({
  productId,
  productTitle,
  vendor,
  price,
  currency,
  availableForSale,
}: ProductViewedTrackerProps) {
  useEffect(() => {
    posthog.capture("product_viewed", {
      product_id: productId,
      product_title: productTitle,
      vendor,
      price,
      currency,
      available_for_sale: availableForSale,
    });
    // Only fire once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
