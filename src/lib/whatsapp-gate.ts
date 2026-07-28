import type { Money } from "@/lib/commerce/types";

/**
 * Minimum price at which a product page offers WhatsApp as a buying channel.
 *
 * Business decision (2026-07): WhatsApp is currently the highest-action channel
 * on the site, which pulls buyers out of a checkout that already works. The
 * goal is to keep ordinary purchases on-site and reserve human advice for the
 * high-ticket commercial equipment where a conversation is what actually
 * closes the sale. A currency missing from this table gets no WhatsApp CTA.
 */
export const WHATSAPP_CTA_THRESHOLD: Record<string, number> = {
  MXN: 100_000,
  USD: 5_000,
};

/** Whether a product at this price is worth routing to a human conversation. */
export function shouldShowWhatsappCta(price: Money): boolean {
  const threshold = WHATSAPP_CTA_THRESHOLD[price.currencyCode];
  if (threshold === undefined) return false;

  const amount = parseFloat(price.amount);
  if (Number.isNaN(amount)) return false;

  return amount >= threshold;
}
