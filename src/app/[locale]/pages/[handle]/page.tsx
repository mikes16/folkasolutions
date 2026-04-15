import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { commerce } from "@/lib/commerce";
import { localeCountryMap, type Locale } from "@/i18n/config";

export const revalidate = 300;

interface Props {
  params: Promise<{ handle: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, locale } = await params;
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const page = await commerce.getPage(handle, { country, language });
  if (!page) return {};

  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function CmsPage({ params }: Props) {
  const { handle, locale } = await params;
  setRequestLocale(locale);
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;

  const page = await commerce.getPage(handle, { country, language });
  if (!page) notFound();

  return (
    <div className="container-page py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          {page.title}
        </h1>
        <div
          className="prose prose-lg max-w-none [&>p]:leading-relaxed [&>p]:text-foreground/80 [&>h2]:tracking-tight [&>h2]:font-bold [&>h3]:tracking-tight [&>ul]:text-foreground/80 [&>ol]:text-foreground/80"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </div>
  );
}
