import { setRequestLocale, getTranslations } from "next-intl/server";
import { makeContainer } from "@/infrastructure/customer/container";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.profile" });

  const { getProfile } = makeContainer();
  const customer = await getProfile.execute();

  return (
    <div className="max-w-md">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2rem,4vw,3rem)] text-foreground">
          {t("title")}
        </h1>
        <div className="mt-6 h-px w-20 bg-secondary" aria-hidden="true" />
      </header>

      <ProfileForm
        initial={{
          firstName: customer.firstName ?? "",
          lastName: customer.lastName ?? "",
          phone: customer.phone ?? "",
        }}
        labels={{
          firstName: t("labels.firstName"),
          lastName: t("labels.lastName"),
          phone: t("labels.phone"),
        }}
        helpers={{
          phoneReadOnly: t("phoneReadOnly"),
        }}
        actions={{
          save: t("save"),
          saving: t("saving"),
          success: t("success"),
        }}
        errorMessages={{
          firstNameRequired: t("errors.firstNameRequired"),
          lastNameRequired: t("errors.lastNameRequired"),
          generic: t("errors.generic"),
        }}
      />
    </div>
  );
}
