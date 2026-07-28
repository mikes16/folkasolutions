import type { Cart, Money } from "./types";
import { MX_IVA_RATE, shouldShowTaxNote } from "@/lib/tax-display";

export interface CartTaxLine {
  amount: Money;
  isEstimate: boolean;
}

export interface CartTotalsView {
  subtotal: Money;
  /** Null when the surface should say "calculated at checkout" instead. */
  taxLine: CartTaxLine | null;
  total: Money;
  totalIsEstimate: boolean;
}

function money(amount: number, currencyCode: string): Money {
  return { amount: amount.toFixed(2), currencyCode };
}

/**
 * What the cart summary should display before handing off to Shopify's
 * checkout. Shopify only returns a real `totalTaxAmount` once the buyer has
 * a full address, so for Mexico we estimate the uniform 16% IVA locally to
 * kill the price surprise at the first checkout screen. For the US we never
 * estimate (sales tax varies by state).
 */
export function getCartTotalsView(
  cart: Cart,
  country: string | undefined
): CartTotalsView {
  const subtotal = cart.cost.subtotalAmount;
  const realTax = cart.cost.totalTaxAmount;

  if (realTax && parseFloat(realTax.amount) > 0) {
    return {
      subtotal,
      taxLine: { amount: realTax, isEstimate: false },
      total: cart.cost.totalAmount,
      totalIsEstimate: false,
    };
  }

  if (shouldShowTaxNote(country)) {
    const base = parseFloat(subtotal.amount);
    const iva = base * MX_IVA_RATE;
    return {
      subtotal,
      taxLine: { amount: money(iva, subtotal.currencyCode), isEstimate: true },
      total: money(base + iva, subtotal.currencyCode),
      totalIsEstimate: true,
    };
  }

  return {
    subtotal,
    taxLine: null,
    total: cart.cost.totalAmount,
    totalIsEstimate: false,
  };
}
