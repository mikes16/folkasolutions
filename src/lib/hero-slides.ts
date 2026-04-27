import type { Locale } from "@/i18n/config";

/**
 * PLACEHOLDER hero slides for the homepage carousel.
 *
 * Curated editorial selection that tells the "Ecosistema Folka" story:
 * prosumer espresso → design-forward brewer → commercial espresso →
 * commercial grinder → precision accessory. Swap to a Shopify collection
 * later by keeping the HeroSlide shape stable.
 *
 * Image files live in public/hero/ as WebP pairs:
 *   {product}.webp  — main product image (transparent bg)
 *   {product}_1.webp — lifestyle / alternate perspective
 */

export interface HeroSlide {
  id: string;
  brand: string;
  title: string;
  /** Short commercial name displayed as giant watermark text */
  watermark: string;
  chapterLabel: string;
  tagline: string;
  ctaText: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Lifestyle image — alternate perspective of the product (desktop only) */
  lifestyleImageUrl: string | null;
  /** Optional looping video for the lifestyle slot. When present, the video
   * replaces the lifestyle image on devices that respect autoplay. The poster
   * is shown as fallback (slow connection, prefers-reduced-motion, mobile). */
  lifestyleVideoUrl: string | null;
  lifestyleVideoPosterUrl: string | null;
}

interface PlaceholderHeroSlide {
  id: string;
  brand: string;
  title: string;
  watermark: string;
  href: string;
  imageUrl: string | null;
  lifestyleImageUrl: string | null;
  lifestyleVideoUrl: string | null;
  lifestyleVideoPosterUrl: string | null;
  i18n: Record<Locale, { chapterLabel: string; tagline: string; ctaText: string }>;
}

const SLIDES: PlaceholderHeroSlide[] = [
  {
    id: "appartamento-tca",
    brand: "Rocket Espresso",
    title: "Appartamento TCA",
    watermark: "APPARTAMENTO",
    href: "/products/rocket-appartamento-tca",
    imageUrl: "/hero/rocketApartament.webp",
    lifestyleImageUrl: "/hero/rocketApartament_1.webp",
    lifestyleVideoUrl: "https://res.cloudinary.com/insightcollective/video/upload/v1777246308/folka/hero/rocket_appartamento_loop.mp4",
    lifestyleVideoPosterUrl: "/hero/rocket_appartamento_loop_poster.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 01",
        tagline: "Temperature control, redesigned. Four presets. Zero guesswork. Pure E61.",
        ctaText: "Discover the TCA",
      },
      es: {
        chapterLabel: "Capítulo 01",
        tagline: "Control de temperatura, rediseñado. Cuatro presets. Cero improvisación. Pura E61.",
        ctaText: "Descubre la TCA",
      },
    },
  },
  {
    id: "mazzer-philos",
    brand: "Mazzer",
    title: "Philos",
    watermark: "PHILOS",
    href: "/products/philos-pre-sale",
    imageUrl: "/hero/mazzer_philos.webp",
    lifestyleImageUrl: "/hero/mazzer_philos_loop_poster.webp",
    lifestyleVideoUrl: "https://res.cloudinary.com/insightcollective/video/upload/v1777246307/folka/hero/mazzer_philos_loop.mp4",
    lifestyleVideoPosterUrl: "/hero/mazzer_philos_loop_poster.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 02",
        tagline: "Single-dose, redefined. Brushless precision. A new chapter for Mazzer.",
        ctaText: "Discover the Philos",
      },
      es: {
        chapterLabel: "Capítulo 02",
        tagline: "Single-dose, redefinido. Precisión sin escobillas. Un nuevo capítulo para Mazzer.",
        ctaText: "Descubre la Philos",
      },
    },
  },
  {
    id: "xbloom-studio",
    brand: "xBloom",
    title: "xBloom Studio",
    watermark: "XBLOOM",
    href: "/products/xbloom-studio",
    imageUrl: "/hero/xbloom_studio.webp",
    lifestyleImageUrl: "/hero/xbloom_studio_1.webp",
    lifestyleVideoUrl: "https://res.cloudinary.com/insightcollective/video/upload/v1777246311/folka/hero/xbloom_studio_loop.mp4",
    lifestyleVideoPosterUrl: "/hero/xbloom_studio_loop_poster.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 03",
        tagline: "Specialty pour-over, reimagined. Ceramic dripper, auto-tuned recipes.",
        ctaText: "Discover xBloom",
      },
      es: {
        chapterLabel: "Capítulo 03",
        tagline: "Pour-over de especialidad, reinventado. Dripper de cerámica, recetas afinadas.",
        ctaText: "Descubre xBloom",
      },
    },
  },
  {
    id: "slayer-steam-single",
    brand: "Slayer",
    title: "Steam Single",
    watermark: "STEAM SINGLE",
    href: "/products/slayer-steam-single",
    imageUrl: "/hero/slayer_steam_single.webp",
    lifestyleImageUrl: "/hero/slayer_steam_single_1.webp",
    lifestyleVideoUrl: "https://res.cloudinary.com/insightcollective/video/upload/v1777246310/folka/hero/slayer_steam_single_loop.mp4",
    lifestyleVideoPosterUrl: "/hero/slayer_steam_single_loop_poster.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 04",
        tagline: "Commercial soul. Artisan scale. Unmatched steam performance.",
        ctaText: "Meet Steam Single",
      },
      es: {
        chapterLabel: "Capítulo 04",
        tagline: "Alma comercial. Escala artesanal. Vapor sin comparación.",
        ctaText: "Conoce la Steam Single",
      },
    },
  },
  {
    id: "acaia-lunar",
    brand: "Acaia",
    title: "Lunar",
    watermark: "LUNAR",
    href: "/products/acaia-lunar",
    imageUrl: "/hero/acaia_lunar.webp",
    lifestyleImageUrl: "/hero/acaia_lunar_1.webp",
    lifestyleVideoUrl: "https://res.cloudinary.com/insightcollective/video/upload/v1777246305/folka/hero/acaia_lunar_loop.mp4",
    lifestyleVideoPosterUrl: "/hero/acaia_lunar_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 05",
        tagline: "Precision in the palm. Sub-0.1g resolution. Built for the bar.",
        ctaText: "Discover Lunar",
      },
      es: {
        chapterLabel: "Capítulo 05",
        tagline: "Precisión en la palma. Resolución sub-0.1g. Hecha para la barra.",
        ctaText: "Descubre la Lunar",
      },
    },
  },
];

export function getHeroSlides(locale: Locale): HeroSlide[] {
  return SLIDES.map((slide) => ({
    id: slide.id,
    brand: slide.brand,
    title: slide.title,
    watermark: slide.watermark,
    chapterLabel: slide.i18n[locale].chapterLabel,
    tagline: slide.i18n[locale].tagline,
    ctaText: slide.i18n[locale].ctaText,
    href: slide.href,
    imageUrl: slide.imageUrl,
    imageAlt: slide.title,
    lifestyleImageUrl: slide.lifestyleImageUrl,
    lifestyleVideoUrl: slide.lifestyleVideoUrl,
    lifestyleVideoPosterUrl: slide.lifestyleVideoPosterUrl,
  }));
}
