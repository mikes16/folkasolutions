import type { Money } from "@/lib/commerce/types";

/**
 * Minimum price at which a product page offers WhatsApp as a buying channel.
 *
 * Business decision (2026-07): keep ordinary purchases (accessories, small
 * brewing gear) on-site and reserve human advice for equipment where a
 * conversation is what actually closes the sale.
 *
 * Revised 2026-08-17: the original $100k MXN gate sat far above where the
 * demand lived. In the 60 days before the gate, 77% of WhatsApp clicks were on
 * products between $15k and $100k MXN, and after the gate those same machines
 * piled up as checkouts abandoned at the payment step with no human fallback.
 * The threshold now starts where that demand starts. A currency missing from
 * this table gets no WhatsApp CTA.
 */
export const WHATSAPP_CTA_THRESHOLD: Record<string, number> = {
  MXN: 15_000,
  USD: 800,
};

/** Whether a product at this price is worth routing to a human conversation. */
export function shouldShowWhatsappCta(price: Money): boolean {
  const threshold = WHATSAPP_CTA_THRESHOLD[price.currencyCode];
  if (threshold === undefined) return false;

  const amount = parseFloat(price.amount);
  if (Number.isNaN(amount)) return false;

  return amount >= threshold;
}
