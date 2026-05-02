import { setRequestLocale, getTranslations } from "next-intl/server";
import { makeContainer } from "@/infrastructure/customer/container";
import { RecentOrderCard } from "@/components/account/RecentOrderCard";
import { DefaultAddressCard } from "@/components/account/DefaultAddressCard";

export default async function AccountDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.dashboard" });

  const { getProfile, getOrders, listAddresses } = makeContainer();

  // Fetch the three data sources in parallel and tolerate individual
  // failures: the dashboard is informational, so a 500 from any single
  // call should degrade gracefully into an empty state rather than crash
  // the page.
  const [profileResult, ordersResult, addressesResult] = await Promise.allSettled([
    getProfile.execute(),
    getOrders.execute({ cursor: null, pageSize: 1 }),
    listAddresses.execute(),
  ]);

  if (profileResult.status === "rejected") {
    console.error("[account/dashboard] getProfile failed", profileResult.reason);
  }
  if (ordersResult.status === "rejected") {
    console.error("[account/dashboard] getOrders failed", ordersResult.reason);
  }
  if (addressesResult.status === "rejected") {
    console.error(
      "[account/dashboard] listAddresses failed",
      addressesResult.reason,
    );
  }

  const customer =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const recentOrder =
    ordersResult.status === "fulfilled" && ordersResult.value.orders.length > 0
      ? ordersResult.value.orders[0]
      : null;
  // Prefer the address whose id matches `defaultAddressId`. When that is
  // absent (no default set, or list is empty) fall back to the first
  // address so the dashboard still surfaces something useful.
  const defaultAddress = (() => {
    if (addressesResult.status !== "fulfilled") return null;
    const { addresses, defaultAddressId } = addressesResult.value;
    if (addresses.length === 0) return null;
    if (defaultAddressId) {
      const match = addresses.find((entry) => entry.id === defaultAddressId);
      if (match) return match.address;
    }
    return addresses[0].address;
  })();

  const greeting = customer?.firstName
    ? `${t("greeting")}, ${customer.firstName}.`
    : t("greetingNoName");

  return (
    <div className="space-y-12 md:space-y-16">
      <header>
        <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-foreground">
          {greeting}
        </h1>
        <div className="mt-6 h-px w-20 bg-secondary" aria-hidden="true" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <section className="lg:col-span-2">
          <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.25em] text-secondary text-[11px] mb-6">
            {t("recentOrderEyebrow")}
          </p>
          {recentOrder ? (
            <RecentOrderCard
              order={recentOrder}
              locale={locale}
              viewAllLabel={t("viewOrder")}
            />
          ) : (
            <p className="text-foreground/60">{t("emptyOrders")}</p>
          )}
        </section>

        <aside className="lg:col-span-1">
          <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.25em] text-secondary text-[11px] mb-6">
            {t("defaultAddressEyebrow")}
          </p>
          {defaultAddress ? (
            <DefaultAddressCard
              address={defaultAddress}
              editLabel={t("editAddress")}
              editHref={`/${locale}/account/addresses`}
            />
          ) : (
            <p className="text-foreground/60">{t("emptyAddresses")}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
