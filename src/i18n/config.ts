export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export type CountryCode = "US" | "MX";
export type CurrencyCode = "USD" | "MXN";
export type LanguageCode = "EN" | "ES";

export const localeCountryMap: Record<Locale, { country: CountryCode; currency: CurrencyCode; language: LanguageCode; label: string }> = {
  en: { country: "US", currency: "USD", language: "EN", label: "USD $" },
  es: { country: "MX", currency: "MXN", language: "ES", label: "MXN $" },
};
