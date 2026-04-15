import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { refundContent } from "@/content/legal/refund";
import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.refund" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/pages/refund-policy`,
      languages: {
        en: "/en/pages/refund-policy",
        es: "/es/pages/refund-policy",
      },
    },
  };
}

export default async function RefundPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const tRefund = await getTranslations("legal.refund");

  const doc = refundContent[locale as Locale] ?? refundContent.es;

  return (
    <LegalDocumentView
      eyebrow={tRefund("eyebrow")}
      title={tRefund("title")}
      updatedLabel={t("updated")}
      document={doc}
    />
  );
}
