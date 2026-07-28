import type { Money } from "@/lib/commerce/types";

const localeMap: Record<string, string> = {
  USD: "en-US",
  MXN: "es-MX",
};

export function formatMoney(money: Money): string {
  const locale = localeMap[money.currencyCode] || "en-US";
  const value = parseFloat(money.amount);
  // MXN reads cleaner without decimals, but rounding real cents away would
  // make the displayed total disagree with Shopify's checkout.
  const digits = money.currencyCode === "MXN" && Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
