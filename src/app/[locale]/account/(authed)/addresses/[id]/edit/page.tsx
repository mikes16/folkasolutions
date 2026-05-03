import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { makeContainer } from "@/infrastructure/customer/container";
import { AddressForm } from "@/components/account/AddressForm";

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.addresses" });

  const decodedId = decodeURIComponent(id);

  const { listAddresses } = makeContainer();
  const { addresses, defaultAddressId } = await listAddresses.execute();
  const entry = addresses.find((item) => item.id === decodedId);
  if (!entry) {
    notFound();
  }

  const { address } = entry;
  const cancelHref = `/${locale}/account/addresses`;

  return (
    <div className="max-w-2xl">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2rem,4vw,3rem)] text-foreground">
          {t("form.editTitle")}
        </h1>
        <div className="mt-6 h-px w-20 bg-secondary" aria-hidden="true" />
      </header>

      <AddressForm
        locale={locale}
        addressId={decodedId}
        cancelHref={cancelHref}
        initial={{
          firstName: address.firstName,
          lastName: address.lastName,
          company: address.company ?? "",
          address1: address.address1,
          address2: address.address2 ?? "",
          city: address.city,
          provinceCode: address.provinceCode,
          countryCode: address.countryCode,
          zip: address.zip,
          phone: address.phone ?? "",
          setDefault: entry.id === defaultAddressId,
        }}
        labels={{
          firstName: t("form.labels.firstName"),
          lastName: t("form.labels.lastName"),
          company: t("form.labels.company"),
          address1: t("form.labels.address1"),
          address2: t("form.labels.address2"),
          city: t("form.labels.city"),
          provinceCode: t("form.labels.provinceCode"),
          countryCode: t("form.labels.countryCode"),
          zip: t("form.labels.zip"),
          phone: t("form.labels.phone"),
          setDefault: t("form.labels.setDefault"),
        }}
        actions={{
          save: t("form.save"),
          saving: t("form.saving"),
          cancel: t("form.cancel"),
        }}
        errorMessages={{
          required: t("form.errors.required"),
          phoneInvalid: t("form.errors.phoneInvalid"),
          zipInvalid: t("form.errors.zipInvalid"),
          countryInvalid: t("form.errors.countryInvalid"),
          generic: t("form.errors.generic"),
        }}
      />
    </div>
  );
}
