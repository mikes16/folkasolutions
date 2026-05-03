"use client";

import Link from "next/link";
import { useRef } from "react";
import { deleteAddressAction } from "@/app/[locale]/account/(authed)/addresses/actions";

interface CardLabels {
  default: string;
  edit: string;
  delete: string;
}

interface DialogLabels {
  title: string;
  body: string;
  confirm: string;
  cancel: string;
}

/**
 * Plain-object shape of an Address suitable for the Server → Client
 * Component boundary. The domain `Address` is a class with a private
 * constructor, which Next.js RSC refuses to serialize. The page presenter
 * converts each domain Address into this shape before passing to the card.
 */
export interface AddressCardView {
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  provinceCode: string;
  countryCode: string;
  zip: string;
  phone: string | null;
}

interface Props {
  addressId: string;
  address: AddressCardView;
  isDefault: boolean;
  editHref: string;
  labels: CardLabels;
  dialogLabels: DialogLabels;
}

/**
 * One row in the addresses grid. Renders the address summary, an edit
 * link, and a delete button that opens a confirmation `<dialog>`.
 *
 * Native `<dialog>` is used instead of a portal/modal library because
 * browsers handle the Escape key, focus trap, and inert-background
 * semantics for free, and the only state we need is open/closed.
 */
export function AddressCard({
  addressId,
  address,
  isDefault,
  editHref,
  labels,
  dialogLabels,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const fullName = `${address.firstName} ${address.lastName}`.trim();
  const cityLine = `${address.city}, ${address.provinceCode} ${address.zip}`;

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <article className="border border-secondary p-6 flex flex-col">
      {isDefault ? (
        <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.25em] text-[10px] text-secondary mb-3">
          {labels.default}
        </p>
      ) : null}

      <p className="text-foreground text-[16px] font-medium">{fullName}</p>
      <div className="mt-2 space-y-1 text-foreground/70 text-[14px]">
        {address.company ? <p>{address.company}</p> : null}
        <p>{address.address1}</p>
        {address.address2 ? <p>{address.address2}</p> : null}
        <p>{cityLine}</p>
        <p>{address.countryCode}</p>
        {address.phone ? <p>{address.phone}</p> : null}
      </div>

      <div className="mt-6 flex items-center gap-6">
        <Link
          href={editHref}
          className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[12px] text-foreground hover:text-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {labels.edit}
        </Link>
        <button
          type="button"
          onClick={openDialog}
          className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[12px] text-foreground/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {labels.delete}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`delete-title-${addressId}`}
        className="backdrop:bg-foreground/40 bg-background text-foreground p-0 max-w-md w-[calc(100%-2rem)]"
      >
        <div className="p-8">
          <h2
            id={`delete-title-${addressId}`}
            className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[24px] text-foreground"
          >
            {dialogLabels.title}
          </h2>
          <p className="mt-4 text-sm text-foreground/70">{dialogLabels.body}</p>

          <div className="mt-6 border-l-[3px] border-secondary pl-4 text-sm text-foreground/80">
            <p className="font-medium">{fullName}</p>
            <p>{address.address1}</p>
            <p>{cityLine}</p>
          </div>

          <div className="mt-8 flex flex-col-reverse md:flex-row md:items-center gap-3">
            <button
              type="button"
              onClick={closeDialog}
              className="md:flex-1 px-6 py-3 border border-foreground/30 text-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {dialogLabels.cancel}
            </button>
            <form
              action={deleteAddressAction}
              className="md:flex-1"
            >
              <input type="hidden" name="addressId" value={addressId} />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-primary-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                {dialogLabels.confirm}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </article>
  );
}
