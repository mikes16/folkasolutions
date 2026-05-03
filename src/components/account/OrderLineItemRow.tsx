import Image from "next/image";
import type { OrderLineItem } from "@/domain/customer/OrderLineItem";
import { formatMoney } from "@/lib/utils/format";

interface Props {
  item: OrderLineItem;
  qtyLabel: string;
}

export function OrderLineItemRow({ item, qtyLabel }: Props) {
  const lineTotalLabel = formatMoney({
    amount: item.subtotal.amount,
    currencyCode: item.subtotal.currencyCode,
  });

  return (
    <div className="flex gap-5 py-5">
      <div className="relative w-24 h-24 md:w-[120px] md:h-[120px] flex-shrink-0 overflow-hidden bg-secondary/20">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="120px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="text-foreground font-medium">{item.title}</h3>
        {item.variantTitle ? (
          <p className="text-foreground/60 text-sm mt-1">{item.variantTitle}</p>
        ) : null}
        <p className="text-foreground/60 text-sm mt-1">
          {qtyLabel}: {item.quantity}
        </p>
        <div className="flex-1" />
        <p className="text-foreground tabular-nums mt-2">{lineTotalLabel}</p>
      </div>
    </div>
  );
}
