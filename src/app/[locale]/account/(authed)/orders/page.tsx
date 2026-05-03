import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { makeContainer } from "@/infrastructure/customer/container";
import { OrderListRow } from "@/components/account/OrderListRow";
import { OrdersPagination } from "@/components/account/OrdersPagination";
import type { FulfillmentStatus } from "@/domain/customer/Order";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string }>;
}

export default async function OrdersPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { cursor } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.orders" });

  const { getOrders } = makeContainer();
  const { orders, nextCursor, hasNextPage } = await getOrders.execute({
    cursor: cursor ?? null,
    pageSize: 20,
  });

  // The fulfillmentStatus value comes from a known string union, but
  // next-intl's `t` is type-strict over its message tree, so we cast to the
  // expected literal-key parameter type rather than `any`.
  const statusLabel = (status: FulfillmentStatus): string =>
    t(`status.${status}` as Parameters<typeof t>[0]);

  return (
    <div>
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2rem,4vw,3rem)] text-foreground">
          {t("title")}
        </h1>
        <div className="mt-6 h-px w-20 bg-secondary" aria-hidden="true" />
      </header>

      {orders.length === 0 ? (
        <div className="max-w-md">
          <p className="font-[family-name:var(--font-rajdhani)] text-2xl text-foreground">
            {t("empty.headline")}
          </p>
          <p className="mt-3 text-foreground/70">{t("empty.body")}</p>
          <Link
            href={`/${locale}/shop`}
            className="mt-8 inline-block font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[12px] text-foreground hover:text-foreground/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {t("empty.cta")} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-[1fr_120px_60px_140px_120px] gap-6 px-3 pb-3 border-b border-foreground/15">
            <span className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/60">
              {t("tableHeaders.orderNumber")}
            </span>
            <span className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/60">
              {t("tableHeaders.date")}
            </span>
            <span className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/60">
              {t("tableHeaders.items")}
            </span>
            <span className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/60 text-right">
              {t("tableHeaders.total")}
            </span>
            <span className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/60">
              {t("tableHeaders.status")}
            </span>
          </div>

          <ul className="divide-y divide-foreground/10">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderListRow
                  order={order}
                  locale={locale}
                  statusLabel={statusLabel(order.fulfillmentStatus)}
                />
              </li>
            ))}
          </ul>

          <OrdersPagination
            hasNextPage={hasNextPage}
            nextCursor={nextCursor}
            currentCursor={cursor ?? null}
            basePath={`/${locale}/account/orders`}
            labels={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
            }}
          />
        </>
      )}
    </div>
  );
}
