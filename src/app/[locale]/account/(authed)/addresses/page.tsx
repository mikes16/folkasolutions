import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { makeContainer } from "@/infrastructure/customer/container";
import { AddressCard } from "@/components/account/AddressCard";

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.addresses" });

  const { listAddresses } = makeContainer();
  const { addresses, defaultAddressId } = await listAddresses.execute();

  const newHref = `/${locale}/account/addresses/new`;

  return (
    <div className="max-w-4xl">
      <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2rem,4vw,3rem)] text-foreground">
            {t("title")}
          </h1>
          <div className="mt-6 h-px w-20 bg-secondary" aria-hidden="true" />
        </div>
        {addresses.length > 0 ? (
          <Link
            href={newHref}
            className="self-start md:self-auto px-6 py-3 bg-primary text-primary-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {t("newCta")}
          </Link>
        ) : null}
      </header>

      {addresses.length === 0 ? (
        <div className="border border-secondary/60 p-10 max-w-xl">
          <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(1.25rem,3vw,1.75rem)] text-foreground">
            {t("empty.headline")}
          </p>
          <p className="mt-4 text-foreground/70 text-sm leading-relaxed">
            {t("empty.body")}
          </p>
          <Link
            href={newHref}
            className="mt-8 inline-block px-6 py-3 bg-primary text-primary-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {t("newCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((entry) => (
            <AddressCard
              key={entry.id}
              addressId={entry.id}
              address={entry.address}
              isDefault={entry.id === defaultAddressId}
              editHref={`/${locale}/account/addresses/${encodeURIComponent(entry.id)}/edit`}
              labels={{
                default: t("default"),
                edit: t("edit"),
                delete: t("delete"),
              }}
              dialogLabels={{
                title: t("deleteDialog.title"),
                body: t("deleteDialog.body"),
                confirm: t("deleteDialog.confirm"),
                cancel: t("deleteDialog.cancel"),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
