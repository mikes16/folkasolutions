import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * The cart is per-session state, not content. Keeping it out of the index
 * avoids empty-cart pages ranking for product terms; `follow` stays on so
 * crawlers still reach the linked products.
 *
 * The page itself is a client component and cannot export metadata, hence
 * this server layout.
 */
export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });

  return {
    title: t("title"),
    robots: { index: false, follow: true },
  };
}

export default function CartLayout({ children }: Props) {
  return children;
}
