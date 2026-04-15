"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("[Page Error]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center py-32">
      <div className="text-center max-w-md px-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-[family-name:var(--font-rajdhani)]">
          {t("title")}
        </h1>
        <p className="text-muted mb-8">{t("description")}</p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={reset}>
            {t("tryAgain")}
          </Button>
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[2px] font-medium text-muted hover:text-foreground border-b border-transparent hover:border-foreground pb-1 transition-all duration-300"
          >
            {t("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
