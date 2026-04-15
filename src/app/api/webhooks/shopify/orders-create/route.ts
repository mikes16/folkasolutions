import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * Shopify webhook: orders/create
 *
 * Fires a `purchase` event to PostHog with revenue + line items, and
 * identifies the customer so their pre-purchase journey is linked to
 * their email. Requires SHOPIFY_WEBHOOK_SECRET (shared with the
 * webhook subscription in Shopify admin).
 *
 * Configure in Shopify admin:
 *   Settings → Notifications → Webhooks → Create webhook
 *     Event: Order creation
 *     Format: JSON
 *     URL: https://folkasolutions.com/api/webhooks/shopify/orders-create
 */

const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

type ShopifyLineItem = {
  product_id?: number;
  variant_id?: number;
  title?: string;
  variant_title?: string | null;
  quantity?: number;
  price?: string;
  sku?: string | null;
};

type ShopifyOrderPayload = {
  id: number;
  order_number?: number;
  email?: string | null;
  customer?: {
    id?: number;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  total_price?: string;
  subtotal_price?: string;
  total_tax?: string;
  total_shipping_price_set?: { shop_money?: { amount?: string } };
  currency?: string;
  presentment_currency?: string;
  line_items?: ShopifyLineItem[];
  note_attributes?: Array<{ name?: string; value?: string }>;
  landing_site?: string | null;
  referring_site?: string | null;
  source_name?: string | null;
  created_at?: string;
};

function verifyHmac(rawBody: string, hmacHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !hmacHeader) return false;
  const digest = createHmac("sha256", WEBHOOK_SECRET).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function findDistinctIdFromNote(order: ShopifyOrderPayload): string | null {
  // We pass the PostHog distinct_id via cart note attributes so we can
  // stitch the anonymous pre-checkout session to the purchase.
  const attr = order.note_attributes?.find((a) => a.name === "posthog_distinct_id");
  return attr?.value ?? null;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");

  if (!verifyHmac(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const posthog = getPostHogClient();

  const email = order.customer?.email ?? order.email ?? undefined;
  const customerId = order.customer?.id ? String(order.customer.id) : undefined;
  const anonDistinctId = findDistinctIdFromNote(order);

  // Prefer the anonymous distinct_id from the cart session so we stitch
  // the full journey. Fall back to email, then customer id.
  const distinctId = anonDistinctId ?? email ?? customerId ?? `order_${order.id}`;

  // Identify with the customer's stable traits so future events from
  // the same email/customer_id coalesce into one person.
  if (email || customerId) {
    posthog.identify({
      distinctId,
      properties: {
        email,
        shopify_customer_id: customerId,
        first_name: order.customer?.first_name ?? undefined,
        last_name: order.customer?.last_name ?? undefined,
      },
    });
    if (email && anonDistinctId && anonDistinctId !== email) {
      posthog.alias({ distinctId: email, alias: anonDistinctId });
    }
  }

  posthog.capture({
    distinctId,
    event: "purchase",
    properties: {
      order_id: order.id,
      order_number: order.order_number,
      revenue: order.total_price ? Number(order.total_price) : undefined,
      subtotal: order.subtotal_price ? Number(order.subtotal_price) : undefined,
      tax: order.total_tax ? Number(order.total_tax) : undefined,
      shipping: order.total_shipping_price_set?.shop_money?.amount
        ? Number(order.total_shipping_price_set.shop_money.amount)
        : undefined,
      currency: order.currency ?? order.presentment_currency,
      item_count: order.line_items?.reduce((n, li) => n + (li.quantity ?? 0), 0) ?? 0,
      items:
        order.line_items?.map((li) => ({
          product_id: li.product_id,
          variant_id: li.variant_id,
          product_title: li.title,
          variant_title: li.variant_title,
          quantity: li.quantity,
          price: li.price ? Number(li.price) : undefined,
          sku: li.sku,
        })) ?? [],
      landing_site: order.landing_site,
      referring_site: order.referring_site,
      source: order.source_name,
    },
  });

  await posthog.flush();

  return NextResponse.json({ ok: true });
}
