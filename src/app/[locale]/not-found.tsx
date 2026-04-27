import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";

export default async function NotFound() {
  const t = await getTranslations("emptyState");

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="container-page">
        <EmptyState
          eyebrow={t("notFoundEyebrow")}
          title={t("notFoundTitle")}
          description={t("notFoundDescription")}
          ctaHref="/"
          ctaText={t("backHome")}
        />
      </div>
    </div>
  );
}
