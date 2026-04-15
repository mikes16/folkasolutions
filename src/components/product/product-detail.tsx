"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product, Image as ImageType } from "@/lib/commerce/types";
import { ProductGallery } from "./product-gallery";
import { ProductInfo } from "./product-info";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const variant = product.variants[selectedVariantIndex];

  const imageDrivingOption = useImageDrivingOption(product);
  const selectedOptionValue = imageDrivingOption
    ? variant?.selectedOptions.find((o) => o.name === imageDrivingOption)?.value
    : undefined;

  const filteredImages = useVariantFilteredImages(product, imageDrivingOption, selectedOptionValue);

  useImagePreload(product);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
      <div className="md:sticky md:top-8">
        <ProductGallery
          images={filteredImages}
          title={product.title}
        />
      </div>
      <ProductInfo
        product={product}
        selectedVariantIndex={selectedVariantIndex}
        onVariantChange={setSelectedVariantIndex}
      />
    </div>
  );
}

function useImageDrivingOption(product: Product): string | null {
  return useMemo(() => {
    if (product.variants.length <= 1) return null;

    for (const option of product.options) {
      if (option.values.length <= 1) continue;

      const imagesByValue = new Map<string, string | undefined>();
      let hasDistinctImages = false;

      for (const v of product.variants) {
        const optValue = v.selectedOptions.find((o) => o.name === option.name)?.value;
        if (!optValue || !v.image) continue;

        const existing = imagesByValue.get(optValue);
        if (existing === undefined) {
          imagesByValue.set(optValue, v.image.url);
        }
      }

      const uniqueUrls = new Set(imagesByValue.values());
      if (uniqueUrls.size > 1) hasDistinctImages = true;

      if (hasDistinctImages) return option.name;
    }

    return null;
  }, [product]);
}

function useVariantFilteredImages(
  product: Product,
  optionName: string | null,
  selectedValue: string | undefined
): ImageType[] {
  return useMemo(() => {
    if (!optionName || !selectedValue) return product.images;

    const valueVariantUrls = new Map<string, Set<string>>();
    for (const v of product.variants) {
      const val = v.selectedOptions.find((o) => o.name === optionName)?.value;
      if (!val || !v.image) continue;
      if (!valueVariantUrls.has(val)) valueVariantUrls.set(val, new Set());
      valueVariantUrls.get(val)!.add(v.image.url);
    }

    const allVariantUrls = new Set<string>();
    for (const urls of valueVariantUrls.values()) {
      for (const url of urls) allVariantUrls.add(url);
    }

    const valueBases = new Map<string, string[]>();
    for (const [val, urls] of valueVariantUrls) {
      valueBases.set(val, [...urls].map(extractFileBase));
    }

    const imageValueMap = new Map<string, string>();

    for (const img of product.images) {
      if (allVariantUrls.has(img.url)) {
        for (const [val, urls] of valueVariantUrls) {
          if (urls.has(img.url)) {
            imageValueMap.set(img.url, val);
            break;
          }
        }
        continue;
      }

      const imgBase = extractFileBase(img.url);
      for (const [val, bases] of valueBases) {
        if (bases.some((base) => base.length > 6 && imgBase.includes(base))) {
          imageValueMap.set(img.url, val);
          break;
        }
      }
    }

    const variantImages: ImageType[] = [];
    const genericImages: ImageType[] = [];

    for (const img of product.images) {
      const assignedValue = imageValueMap.get(img.url);
      if (!assignedValue) {
        genericImages.push(img);
      } else if (assignedValue === selectedValue) {
        variantImages.push(img);
      }
    }

    return [...variantImages, ...genericImages];
  }, [product, optionName, selectedValue]);
}

function extractFileBase(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() ?? "";
    return filename
      .replace(/\.[^.]+$/, "")
      .replace(/[?#].*$/, "")
      .toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function useImagePreload(product: Product) {
  useEffect(() => {
    const urls = new Set<string>();
    for (const img of product.images) urls.add(img.url);
    for (const v of product.variants) {
      if (v.image) urls.add(v.image.url);
    }
    for (const url of urls) {
      const preload = new window.Image();
      preload.src = url;
    }
  }, [product]);
}
