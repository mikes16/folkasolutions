import { setRequestLocale } from "next-intl/server";

export default async function AccountDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-4xl text-foreground mb-6">
        Dashboard placeholder
      </h1>
      <p className="text-foreground/70">Real dashboard ships in Task 23.</p>
    </div>
  );
}
