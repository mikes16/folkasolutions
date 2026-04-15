import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex-1 flex items-center justify-center py-32">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-4">404</h1>
        <p className="text-muted mb-8">{t("title")}</p>
        <Link
          href="/"
          className="text-xs uppercase tracking-[2px] font-medium border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
