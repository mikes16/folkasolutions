import Link from "next/link";
import type { Address } from "@/domain/customer/Address";

interface Props {
  address: Address;
  editLabel: string;
  editHref: string;
}

export function DefaultAddressCard({ address, editLabel, editHref }: Props) {
  const fullName = `${address.firstName} ${address.lastName}`.trim();
  const cityLine = `${address.city}, ${address.provinceCode} ${address.zip}`;

  return (
    <article className="border border-secondary p-6">
      <p className="text-foreground text-[16px] font-medium">{fullName}</p>
      <div className="mt-2 space-y-1 text-foreground/70 text-[14px]">
        <p>{address.address1}</p>
        {address.address2 ? <p>{address.address2}</p> : null}
        <p>{cityLine}</p>
        <p>{address.countryCode}</p>
      </div>

      <Link
        href={editHref}
        className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[14px] text-foreground hover:text-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {editLabel}
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </article>
  );
}
