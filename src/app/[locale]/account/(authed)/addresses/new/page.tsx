import { setRequestLocale, getTranslations } from "next-intl/server";
import { AddressForm } from "@/components/account/AddressForm";

export default async function NewAddressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.addresses" });

  const cancelHref = `/${locale}/account/addresses`;

  return (
    <div className="max-w-2xl">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2rem,4vw,3rem)] text-foreground">
          {t("form.newTitle")}
        </h1>
        <div className="mt-6 h-px w-20 bg-secondary" aria-hidden="true" />
      </header>

      <AddressForm
        locale={locale}
        cancelHref={cancelHref}
        initial={{
          firstName: "",
          lastName: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          provinceCode: "",
          countryCode: "MX",
          zip: "",
          phone: "",
          setDefault: false,
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
