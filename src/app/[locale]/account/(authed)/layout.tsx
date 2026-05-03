import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { makeContainer } from "@/infrastructure/customer/container";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default async function AccountAuthedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { refresh } = makeContainer();
  try {
    await refresh.execute();
  } catch {
    redirect(`/${locale}/account/login`);
  }

  const t = await getTranslations({ locale, namespace: "account.nav" });

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
      <AccountSidebar
        locale={locale}
        labels={{
          dashboard: t("dashboard"),
          orders: t("orders"),
          profile: t("profile"),
          addresses: t("addresses"),
          logout: t("logout"),
        }}
      />
      <main className="px-6 py-12 md:px-12 md:py-16">{children}</main>
    </div>
  );
}
