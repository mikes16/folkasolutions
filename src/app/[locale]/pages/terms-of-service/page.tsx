import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { termsContent } from "@/content/legal/terms";
import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/pages/terms-of-service`,
      languages: {
        en: "/en/pages/terms-of-service",
        es: "/es/pages/terms-of-service",
      },
    },
  };
}

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const tTerms = await getTranslations("legal.terms");

  const doc = termsContent[locale as Locale] ?? termsContent.es;

  return (
    <LegalDocumentView
      eyebrow={tTerms("eyebrow")}
      title={tTerms("title")}
      updatedLabel={t("updated")}
      document={doc}
    />
  );
}
