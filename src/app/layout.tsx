import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import { getLocale } from "next-intl/server";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

// Default social preview image: pre-designed 1200x630 asset served from
// Cloudinary. Transforms force JPG (max client compatibility incl. WhatsApp)
// and auto quality. Used as a fallback for any page that doesn't define
// its own og:image.
const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/insightcollective/image/upload/f_jpg,q_auto/v1776360628/whatsapp_image_ntxwih.png";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Folka Coffee | Premium Coffee Equipment",
    template: "%s | Folka Coffee",
  },
  description:
    "Official importers of Rocket Espresso, Profitec, Mazzer, Fellow & more. Premium coffee equipment for the discerning barista.",
  metadataBase: new URL(siteConfig.siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Folka Coffee",
    locale: "es_MX",
    alternateLocale: "en_US",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Folka Coffee Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: siteConfig.siteUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} ${rajdhani.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
