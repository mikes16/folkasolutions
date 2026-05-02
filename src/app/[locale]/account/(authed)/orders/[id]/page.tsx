import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { makeContainer } from "@/infrastructure/customer/container";
import { OrderLineItemRow } from "@/components/account/OrderLineItemRow";
import { formatMoney } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.orderDetail" });

  const { getOrder } = makeContainer();
  // The dynamic segment carries a URL-encoded Shopify GID (it contains
  // `gid://shopify/Order/...` with `/` characters). Next.js leaves the
  // value encoded, so we decode it before handing it to the use case.
  const order = await getOrder.execute(decodeURIComponent(id));

  const dateTag = locale === "es" ? "es-MX" : "en-US";
  const dateLabel = new Intl.DateTimeFormat(dateTag, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(order.processedAt));

  // next-intl's `t` is strict-typed over its message tree; the
  // fulfillment status is a known string union, but TypeScript can't
  // narrow the template-literal key on its own. Cast to the parameter
  // type rather than `any`.
  const statusLabel = t(
    `status.${order.fulfillmentStatus}` as Parameters<typeof t>[0],
  );

  const totalLabel = formatMoney({
    amount: order.totalPrice.amount,
    currencyCode: order.totalPrice.currencyCode,
  });

  return (
    <div className="max-w-3xl">
      <Link
        href={`/${locale}/account/orders`}
        className="inline-block font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[12px] text-foreground/60 hover:text-foreground transition-colors mb-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {t("back")}
      </Link>

      <header>
        <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2rem,4vw,3rem)] text-foreground">
          {t("headline", { number: order.orderNumber })}
        </h1>
        <p className="mt-3 text-foreground/60 text-sm">{dateLabel}</p>
      </header>

      <section className="mt-12">
        <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.25em] text-secondary text-[11px] mb-3">
          {t("statusEyebrow")}
        </p>
        <p className="font-[family-name:var(--font-rajdhani)] text-2xl text-foreground">
          {statusLabel}
        </p>
      </section>

      <section className="mt-12">
        <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.25em] text-secondary text-[11px] mb-6">
          {t("lineItemsEyebrow")}
        </p>
        <ul className="divide-y divide-foreground/10">
          {order.lineItems.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <OrderLineItemRow item={item} qtyLabel={t("qty")} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-foreground/15 pt-8 flex justify-between items-baseline">
        <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/70">
          {t("totalLabel")}
        </p>
        <p className="font-[family-name:var(--font-rajdhani)] text-2xl text-foreground tabular-nums">
          {totalLabel}
        </p>
      </section>

      {order.customerOrderUrl ? (
        <a
          href={order.customerOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[12px] text-foreground hover:text-foreground/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {t("viewInShopify")} <span aria-hidden="true">&rarr;</span>
        </a>
      ) : null}
    </div>
  );
}
