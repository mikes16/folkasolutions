"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Cart } from "@/lib/commerce/types";
import { getCartTotalsView } from "@/lib/commerce/cart-totals";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/utils/format";

/**
 * Subtotal / tax / total breakdown shown in both the cart drawer and the
 * cart page. Surfaces the estimated IVA for Mexico before the buyer reaches
 * Shopify's checkout, so the final amount is never a surprise.
 */
export function CartSummary({ cart }: { cart: Cart }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const country = localeCountryMap[locale]?.country;
  const totals = getCartTotalsView(cart, country);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{tc("subtotal")}</span>
        <span className="text-sm font-medium tabular-nums">
          {formatMoney(totals.subtotal)}
        </span>
      </div>

      {totals.taxLine && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">
            {totals.taxLine.isEstimate ? t("taxEstimated") : t("tax")}
          </span>
          <span className="text-sm font-medium tabular-nums">
            {formatMoney(totals.taxLine.amount)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-sm font-medium">
          {totals.totalIsEstimate ? t("estimatedTotal") : t("total")}
        </span>
        <span className="text-lg font-bold tabular-nums">
          {formatMoney(totals.total)}
        </span>
      </div>

      <p className="text-xs text-muted pt-1">
        {totals.taxLine ? t("shippingAtCheckout") : tc("taxesShipping")}
      </p>
    </div>
  );
}
