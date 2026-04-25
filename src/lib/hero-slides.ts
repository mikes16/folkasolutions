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
}

interface PlaceholderHeroSlide {
  id: string;
  brand: string;
  title: string;
  watermark: string;
  href: string;
  imageUrl: string | null;
  lifestyleImageUrl: string | null;
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
    id: "xbloom-studio",
    brand: "xBloom",
    title: "xBloom Studio",
    watermark: "XBLOOM",
    href: "/products/xbloom-studio",
    imageUrl: "/hero/xbloom_studio.webp",
    lifestyleImageUrl: "/hero/xbloom_studio_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 02",
        tagline: "Specialty pour-over, reimagined. Ceramic dripper, auto-tuned recipes.",
        ctaText: "Discover xBloom",
      },
      es: {
        chapterLabel: "Capítulo 02",
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
    i18n: {
      en: {
        chapterLabel: "Chapter 03",
        tagline: "Commercial soul. Artisan scale. Unmatched steam performance.",
        ctaText: "Meet Steam Single",
      },
      es: {
        chapterLabel: "Capítulo 03",
        tagline: "Alma comercial. Escala artesanal. Vapor sin comparación.",
        ctaText: "Conoce la Steam Single",
      },
    },
  },
  {
    id: "mahlkonig-x64",
    brand: "Mahlkönig",
    title: "X64",
    watermark: "X64",
    href: "/products/mahlkonig-x64",
    imageUrl: "/hero/mahlkonig_x64.webp",
    lifestyleImageUrl: "/hero/mahlkonig_x64_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 04",
        tagline: "64mm flat burrs. Silent grind. The heartbeat of the specialty bar.",
        ctaText: "Explore the X64",
      },
      es: {
        chapterLabel: "Capítulo 04",
        tagline: "Fresas planas de 64mm. Molienda silenciosa. El pulso de la barra de especialidad.",
        ctaText: "Explora la X64",
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
  }));
}
