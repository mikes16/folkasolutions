"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { BRANDS, type Brand } from "@/lib/brands";
import { PRODUCT_TYPE_CATEGORIES, type ProductTypeCategory } from "@/lib/product-types";
import {
  priceBucketsForCurrency,
  type PriceBucket,
} from "@/lib/price-buckets";
import {
  type FilterState,
  hasActiveFilters,
  serializeFilterState,
} from "@/lib/commerce/filters";
import type { CurrencyCode } from "@/i18n/config";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

interface FilterBarProps {
  state: FilterState;
  currency: CurrencyCode;
  availableFacets?: {
    vendors: string[];
    productTypes: string[];
  };
  children?: React.ReactNode;
}

type DropdownKey = "brand" | "type" | "price";

export function FilterBar({ state, currency, availableFacets, children }: FilterBarProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const priceBuckets = useMemo(() => priceBucketsForCurrency(currency), [currency]);

  const availableBrands = useMemo<Brand[]>(() => {
    if (!availableFacets) return BRANDS;
    const allowed = new Set(availableFacets.vendors);
    return BRANDS.filter((b) => allowed.has(b.vendor));
  }, [availableFacets]);

  const availableTypes = useMemo<ProductTypeCategory[]>(() => {
    if (!availableFacets) return PRODUCT_TYPE_CATEGORIES;
    const allowed = new Set(availableFacets.productTypes);
    return PRODUCT_TYPE_CATEGORIES.filter((c) => allowed.has(c.productType));
  }, [availableFacets]);

  // A filter dimension is only useful when it can actually change the result.
  // With ≤1 available option, the filter collapses to a no-op.
  const showBrandFilter = availableBrands.length > 1;
  const showTypeFilter = availableTypes.length > 1;
  const showPriceFilter = priceBuckets.length > 1;

  const pushState = useCallback(
    (next: FilterState) => {
      const params = serializeFilterState(next, new URLSearchParams(searchParams.toString()));
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const toggleBrand = useCallback(
    (vendor: string) => {
      const next = state.brands.includes(vendor)
        ? state.brands.filter((v) => v !== vendor)
        : [...state.brands, vendor];
      pushState({ ...state, brands: next });
    },
    [state, pushState]
  );

  const toggleType = useCallback(
    (id: string) => {
      const next = state.typeIds.includes(id)
        ? state.typeIds.filter((v) => v !== id)
        : [...state.typeIds, id];
      pushState({ ...state, typeIds: next });
    },
    [state, pushState]
  );

  const selectPrice = useCallback(
    (id: string | undefined) => {
      pushState({ ...state, priceBucketId: id });
    },
    [state, pushState]
  );

  const clearAll = useCallback(() => {
    pushState({ brands: [], typeIds: [], priceBucketId: undefined });
  }, [pushState]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openDropdown]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (!isSheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsSheetOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isSheetOpen]);

  const active = hasActiveFilters(state);
  const activeChips = useMemo(
    () => buildChips(state, t, priceBuckets),
    [state, t, priceBuckets]
  );

  const hasFilters = showBrandFilter || showTypeFilter || showPriceFilter;

  if (!hasFilters && !children) return null;

  if (!hasFilters && children) {
    return (
      <div className="mb-8 flex items-center">
        <div className="ml-auto">{children}</div>
      </div>
    );
  }

  // Compute dropdown offsets dynamically so hidden dimensions don't
  // leave empty slots in the pill bar layout.
  const visibleTriggers: DropdownKey[] = [];
  if (showBrandFilter) visibleTriggers.push("brand");
  if (showTypeFilter) visibleTriggers.push("type");
  if (showPriceFilter) visibleTriggers.push("price");
  const dropdownOffset = (key: DropdownKey) =>
    visibleTriggers.indexOf(key) * 160;

  return (
    <div className="mb-8">
      {/* Desktop pill bar */}
      <div
        ref={containerRef}
        className="hidden md:flex items-center gap-3 relative"
      >
        {showBrandFilter && (
          <FilterTrigger
            label={t("filters.brand")}
            count={state.brands.length}
            isOpen={openDropdown === "brand"}
            onClick={() =>
              setOpenDropdown((v) => (v === "brand" ? null : "brand"))
            }
          />
        )}
        {showTypeFilter && (
          <FilterTrigger
            label={t("filters.category")}
            count={state.typeIds.length}
            isOpen={openDropdown === "type"}
            onClick={() => setOpenDropdown((v) => (v === "type" ? null : "type"))}
          />
        )}
        {showPriceFilter && (
          <FilterTrigger
            label={t("filters.price")}
            count={state.priceBucketId ? 1 : 0}
            isOpen={openDropdown === "price"}
            onClick={() =>
              setOpenDropdown((v) => (v === "price" ? null : "price"))
            }
          />
        )}

        {active && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] uppercase tracking-[2px] text-muted hover:text-foreground transition-colors"
          >
            {t("filters.clearAll")}
          </button>
        )}

        {children && <div className="ml-auto">{children}</div>}

        {showBrandFilter && openDropdown === "brand" && (
          <DropdownPanel offset={dropdownOffset("brand")}>
            <CheckboxList
              options={availableBrands.map((b) => ({
                value: b.vendor,
                label: b.displayName,
                checked: state.brands.includes(b.vendor),
              }))}
              onToggle={toggleBrand}
            />
          </DropdownPanel>
        )}

        {showTypeFilter && openDropdown === "type" && (
          <DropdownPanel offset={dropdownOffset("type")}>
            <CheckboxList
              options={availableTypes.map((c) => ({
                value: c.id,
                label: t(c.labelKey),
                checked: state.typeIds.includes(c.id),
              }))}
              onToggle={toggleType}
            />
          </DropdownPanel>
        )}

        {showPriceFilter && openDropdown === "price" && (
          <DropdownPanel offset={dropdownOffset("price")}>
            <RadioList
              name="price-bucket"
              options={priceBuckets.map((b) => ({
                value: b.id,
                label: t(b.labelKey),
                checked: state.priceBucketId === b.id,
              }))}
              onSelect={(value) =>
                selectPrice(state.priceBucketId === value ? undefined : value)
              }
              clearLabel={t("filters.clear")}
              onClear={() => selectPrice(undefined)}
              hasSelection={!!state.priceBucketId}
            />
          </DropdownPanel>
        )}
      </div>

      {/* Mobile filter button */}
      <div className="md:hidden flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-border rounded-full text-[11px] uppercase tracking-[2px] text-foreground shadow-sm"
        >
          {t("filters.title")}
          {active && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] rounded-full bg-foreground text-background px-1">
              {state.brands.length + state.typeIds.length + (state.priceBucketId ? 1 : 0)}
            </span>
          )}
        </button>
        {active && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] uppercase tracking-[2px] text-muted"
          >
            {t("filters.clearAll")}
          </button>
        )}
        {children && <div className="ml-auto">{children}</div>}
      </div>

      {/* Active chips row */}
      {activeChips.length > 0 && (
        <div
          className="flex flex-wrap gap-2 mt-4"
          aria-label={t("filters.activeLabel")}
        >
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => pushState(chip.removeFrom(state))}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border/70 rounded-full text-[11px] uppercase tracking-[1.5px] text-foreground hover:bg-foreground/5 transition-colors"
            >
              <span>{chip.label}</span>
              <Icon name="close" size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isSheetOpen && (
        <MobileSheet
          state={state}
          brands={availableBrands}
          types={availableTypes}
          priceBuckets={priceBuckets}
          showBrandFilter={showBrandFilter}
          showTypeFilter={showTypeFilter}
          showPriceFilter={showPriceFilter}
          onClose={() => setIsSheetOpen(false)}
          onToggleBrand={toggleBrand}
          onToggleType={toggleType}
          onSelectPrice={selectPrice}
          onClearAll={clearAll}
        />
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function FilterTrigger({
  label,
  count,
  isOpen,
  onClick,
}: {
  label: string;
  count: number;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-3 rounded-full text-[11px] uppercase tracking-[2px] transition-all",
        isOpen || count > 0
          ? "bg-foreground text-background shadow-sm"
          : "bg-white text-foreground border border-border shadow-sm hover:shadow-md hover:border-foreground/30"
      )}
    >
      <span>{label}</span>
      {count > 0 && (
        <span className={cn(
          "inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] rounded-full px-1",
          isOpen || count > 0 ? "bg-background text-foreground" : "bg-foreground text-background"
        )}>
          {count}
        </span>
      )}
      <Icon
        name="chevron-down"
        size={14}
        className={cn("transition-transform", isOpen && "rotate-180")}
        aria-hidden="true"
      />
    </button>
  );
}

function DropdownPanel({
  children,
  offset = 0,
}: {
  children: React.ReactNode;
  offset?: number;
}) {
  return (
    <div
      role="dialog"
      style={{ left: offset }}
      className="absolute top-full mt-2 min-w-[240px] bg-background border border-border/70 rounded-lg shadow-lg p-3 z-30"
    >
      {children}
    </div>
  );
}

function CheckboxList({
  options,
  onToggle,
}: {
  options: { value: string; label: string; checked: boolean }[];
  onToggle: (value: string) => void;
}) {
  return (
    <ul className="flex flex-col max-h-[320px] overflow-auto">
      {options.map((opt) => (
        <li key={opt.value}>
          <label className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-foreground/5 rounded-md">
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={() => onToggle(opt.value)}
              className="w-4 h-4 accent-foreground"
            />
            <span className="text-sm text-foreground">{opt.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function RadioList({
  name,
  options,
  onSelect,
  clearLabel,
  onClear,
  hasSelection,
}: {
  name: string;
  options: { value: string; label: string; checked: boolean }[];
  onSelect: (value: string) => void;
  clearLabel: string;
  onClear: () => void;
  hasSelection: boolean;
}) {
  return (
    <>
      <ul className="flex flex-col">
        {options.map((opt) => (
          <li key={opt.value}>
            <label className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-foreground/5 rounded-md">
              <input
                type="radio"
                name={name}
                checked={opt.checked}
                onChange={() => onSelect(opt.value)}
                className="w-4 h-4 accent-foreground"
              />
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          </li>
        ))}
      </ul>
      {hasSelection && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 w-full text-[11px] uppercase tracking-[2px] text-muted hover:text-foreground py-2"
        >
          {clearLabel}
        </button>
      )}
    </>
  );
}

function MobileSheet({
  state,
  brands,
  types,
  priceBuckets,
  showBrandFilter,
  showTypeFilter,
  showPriceFilter,
  onClose,
  onToggleBrand,
  onToggleType,
  onSelectPrice,
  onClearAll,
}: {
  state: FilterState;
  brands: Brand[];
  types: ProductTypeCategory[];
  priceBuckets: PriceBucket[];
  showBrandFilter: boolean;
  showTypeFilter: boolean;
  showPriceFilter: boolean;
  onClose: () => void;
  onToggleBrand: (vendor: string) => void;
  onToggleType: (id: string) => void;
  onSelectPrice: (id: string | undefined) => void;
  onClearAll: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-background border-t border-border/70 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/70">
          <span className="text-[11px] uppercase tracking-[2px] text-foreground">
            {t("filters.title")}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("filters.close")}
            className="p-1"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-6 space-y-8">
          {showBrandFilter && (
            <section>
              <h3 className="text-[11px] uppercase tracking-[2px] text-muted mb-3">
                {t("filters.brand")}
              </h3>
              <CheckboxList
                options={brands.map((b) => ({
                  value: b.vendor,
                  label: b.displayName,
                  checked: state.brands.includes(b.vendor),
                }))}
                onToggle={onToggleBrand}
              />
            </section>
          )}

          {showTypeFilter && (
            <section>
              <h3 className="text-[11px] uppercase tracking-[2px] text-muted mb-3">
                {t("filters.category")}
              </h3>
              <CheckboxList
                options={types.map((c) => ({
                  value: c.id,
                  label: t(c.labelKey),
                  checked: state.typeIds.includes(c.id),
                }))}
                onToggle={onToggleType}
              />
            </section>
          )}

          {showPriceFilter && (
            <section>
              <h3 className="text-[11px] uppercase tracking-[2px] text-muted mb-3">
                {t("filters.price")}
              </h3>
              <RadioList
                name="price-bucket-mobile"
                options={priceBuckets.map((b) => ({
                  value: b.id,
                  label: t(b.labelKey),
                  checked: state.priceBucketId === b.id,
                }))}
                onSelect={(value) =>
                  onSelectPrice(state.priceBucketId === value ? undefined : value)
                }
                clearLabel={t("filters.clear")}
                onClear={() => onSelectPrice(undefined)}
                hasSelection={!!state.priceBucketId}
              />
            </section>
          )}
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-border/70">
          <button
            type="button"
            onClick={onClearAll}
            className="flex-1 py-3 text-[11px] uppercase tracking-[2px] text-foreground border border-border/70 rounded-full"
          >
            {t("filters.clearAll")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[2] py-3 text-[11px] uppercase tracking-[2px] bg-foreground text-background rounded-full"
          >
            {t("filters.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chip builder ────────────────────────────────────────────

interface Chip {
  key: string;
  label: string;
  removeFrom: (s: FilterState) => FilterState;
}

function buildChips(
  state: FilterState,
  t: (key: string) => string,
  priceBuckets: PriceBucket[]
): Chip[] {
  const chips: Chip[] = [];

  for (const vendor of state.brands) {
    const brand = BRANDS.find((b) => b.vendor === vendor);
    chips.push({
      key: `brand:${vendor}`,
      label: brand?.displayName ?? vendor,
      removeFrom: (s) => ({ ...s, brands: s.brands.filter((v) => v !== vendor) }),
    });
  }

  for (const id of state.typeIds) {
    const type = PRODUCT_TYPE_CATEGORIES.find((c) => c.id === id);
    if (!type) continue;
    chips.push({
      key: `type:${id}`,
      label: t(type.labelKey),
      removeFrom: (s) => ({ ...s, typeIds: s.typeIds.filter((v) => v !== id) }),
    });
  }

  if (state.priceBucketId) {
    const bucket = priceBuckets.find((b) => b.id === state.priceBucketId);
    if (bucket) {
      chips.push({
        key: `price:${bucket.id}`,
        label: t(bucket.labelKey),
        removeFrom: (s) => ({ ...s, priceBucketId: undefined }),
      });
    }
  }

  return chips;
}
