import Link from "next/link";
import type { Order } from "@/domain/customer/Order";
import { formatMoney } from "@/lib/utils/format";

interface Props {
  order: Order;
  locale: string;
  statusLabel: string;
}

function formatDate(processedAt: string, locale: string): string {
  const tag = locale === "es" ? "es-MX" : "en-US";
  try {
    return new Intl.DateTimeFormat(tag, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(processedAt));
  } catch {
    return processedAt;
  }
}

export function OrderListRow({ order, locale, statusLabel }: Props) {
  const dateLabel = formatDate(order.processedAt, locale);
  const totalLabel = formatMoney({
    amount: order.totalPrice.amount,
    currencyCode: order.totalPrice.currencyCode,
  });

  return (
    <Link
      href={`/${locale}/account/orders/${encodeURIComponent(order.id)}`}
      className="block py-5 px-3 hover:bg-secondary/10 focus-visible:bg-secondary/10 transition-colors duration-150 focus-visible:outline-none"
    >
      <div className="hidden md:grid grid-cols-[1fr_120px_60px_140px_120px] gap-6 items-center">
        <span className="font-[family-name:var(--font-rajdhani)] tracking-[0.05em] text-foreground">
          #{order.orderNumber}
        </span>
        <span className="text-foreground/70 text-sm">{dateLabel}</span>
        <span className="text-foreground/70 text-sm">
          {order.totalQuantity}
        </span>
        <span className="text-foreground text-right tabular-nums">
          {totalLabel}
        </span>
        <span className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[11px] text-foreground/70">
          {statusLabel}
        </span>
      </div>

      <div className="md:hidden flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-[family-name:var(--font-rajdhani)] tracking-[0.05em] text-foreground text-lg">
            #{order.orderNumber}
          </span>
          <span className="text-foreground tabular-nums">{totalLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-foreground/60 font-[family-name:var(--font-rajdhani)]">
          <span>{dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{statusLabel}</span>
        </div>
      </div>
    </Link>
  );
}
