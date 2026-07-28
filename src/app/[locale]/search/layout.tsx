import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Search results are query-driven and infinitely variable, so they carry no
 * SEO value and would dilute the crawl budget. `follow` stays on so crawlers
 * still reach the product pages linked from a result set.
 *
 * The page itself is a client component and cannot export metadata, hence
 * this server layout.
 */
export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: t("search"),
    robots: { index: false, follow: true },
  };
}

export default function SearchLayout({ children }: Props) {
  return children;
}
