import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { privacyContent } from "@/content/legal/privacy";
import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/pages/privacy-policy`,
      languages: {
        en: "/en/pages/privacy-policy",
        es: "/es/pages/privacy-policy",
      },
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const tPrivacy = await getTranslations("legal.privacy");

  const doc = privacyContent[locale as Locale] ?? privacyContent.es;

  return (
    <LegalDocumentView
      eyebrow={tPrivacy("eyebrow")}
      title={tPrivacy("title")}
      updatedLabel={t("updated")}
      document={doc}
    />
  );
}
