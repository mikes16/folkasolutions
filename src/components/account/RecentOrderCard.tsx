import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/domain/customer/Order";
import { formatMoney } from "@/lib/utils/format";

interface Props {
  order: Order;
  locale: string;
  viewAllLabel: string;
}

const FINANCIAL_STATUS_LABELS_ES: Record<string, string> = {
  pending: "Pendiente",
  authorized: "Autorizado",
  paid: "Pagado",
  partially_paid: "Pagado parcialmente",
  refunded: "Reembolsado",
  voided: "Anulado",
};

const FINANCIAL_STATUS_LABELS_EN: Record<string, string> = {
  pending: "Pending",
  authorized: "Authorized",
  paid: "Paid",
  partially_paid: "Partially paid",
  refunded: "Refunded",
  voided: "Voided",
};

function formatDate(processedAt: string, locale: string): string {
  const tag = locale === "es" ? "es-MX" : "en-US";
  try {
    return new Intl.DateTimeFormat(tag, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(processedAt));
  } catch {
    return processedAt;
  }
}

function formatStatus(financialStatus: string, locale: string): string {
  const map =
    locale === "es"
      ? FINANCIAL_STATUS_LABELS_ES
      : FINANCIAL_STATUS_LABELS_EN;
  return map[financialStatus] ?? financialStatus;
}

export function RecentOrderCard({ order, locale, viewAllLabel }: Props) {
  const firstItem = order.lineItems[0];
  const itemCount = order.totalQuantity;
  const dateLabel = formatDate(order.processedAt, locale);
  const statusLabel = formatStatus(order.financialStatus, locale);
  const totalLabel = formatMoney({
    amount: order.totalPrice.amount,
    currencyCode: order.totalPrice.currencyCode,
  });
  const detailHref = `/${locale}/account/orders/${encodeURIComponent(order.id)}`;

  return (
    <article className="border border-secondary p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden bg-secondary/20 md:h-[120px] md:w-[120px]"
          aria-hidden={firstItem?.imageUrl ? undefined : "true"}
        >
          {firstItem?.imageUrl ? (
            <Image
              src={firstItem.imageUrl}
              alt={firstItem.title}
              fill
              sizes="(min-width: 768px) 120px, 80px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-foreground/60 text-[14px]">
            #{order.orderNumber}
          </p>
          <h2 className="mt-2 text-[20px] font-medium text-foreground">
            {firstItem?.title ?? ""}
          </h2>
          {itemCount > 1 ? (
            <p className="mt-1 text-foreground/60 text-[14px]">
              {locale === "es"
                ? `${itemCount} artículos`
                : `${itemCount} items`}
            </p>
          ) : null}

          <p className="mt-4 font-[family-name:var(--font-rajdhani)] text-[24px] text-foreground">
            {totalLabel}
          </p>

          <p className="mt-2 text-foreground/60 text-[14px]">
            {dateLabel} <span aria-hidden="true">·</span> {statusLabel}
          </p>

          <Link
            href={detailHref}
            className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[14px] text-foreground hover:text-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {viewAllLabel}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
