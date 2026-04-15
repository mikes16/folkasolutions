import type { Money } from "@/lib/commerce/types";

const localeMap: Record<string, string> = {
  USD: "en-US",
  MXN: "es-MX",
};

export function formatMoney(money: Money): string {
  const locale = localeMap[money.currencyCode] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: money.currencyCode === "MXN" ? 0 : 2,
    maximumFractionDigits: money.currencyCode === "MXN" ? 0 : 2,
  }).format(parseFloat(money.amount));
}
