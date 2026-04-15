import type { Locale } from "@/i18n/config";

/**
 * PLACEHOLDER hero slides for the homepage carousel.
 *
 * These will be replaced by a Shopify collection (e.g. "rocket-new-arrivals")
 * once the products are uploaded. The HeroSlide shape is the contract — keep
 * it stable so the swap is one file change in src/app/[locale]/page.tsx.
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
    id: "r9v",
    brand: "Rocket Espresso",
    title: "R 9V Pressure Profiling",
    watermark: "R9V",
    href: "/products/r9v-pressure-profiling",
    imageUrl: "/hero/rv9.webp",
    lifestyleImageUrl: "/hero/rv9_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 02",
        tagline: "Multi-boiler precision. Five programmable pressure profiles.",
        ctaText: "Explore the R 9V",
      },
      es: {
        chapterLabel: "Capítulo 02",
        tagline: "Precisión multi-caldera. Cinco perfiles de presión programables.",
        ctaText: "Explora la R 9V",
      },
    },
  },
  {
    id: "sotto-banco",
    brand: "Rocket Espresso",
    title: "Sotto Banco",
    watermark: "SOTTO BANCO",
    href: "/products/sotto-banco",
    imageUrl: "/hero/sotto-banco.webp",
    lifestyleImageUrl: "/hero/sotto-banco_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 03",
        tagline: "An invisible machine. An espresso without compromise.",
        ctaText: "Discover",
      },
      es: {
        chapterLabel: "Capítulo 03",
        tagline: "Una máquina invisible. Un espresso sin compromisos.",
        ctaText: "Descubrir",
      },
    },
  },
  {
    id: "re-doppia",
    brand: "Rocket Espresso",
    title: "RE Doppia",
    watermark: "RE DOPPIA",
    href: "/products/re-doppia",
    imageUrl: "/hero/re_doppia.webp",
    lifestyleImageUrl: "/hero/re_doppia_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 04",
        tagline: "Dual boiler. Saturated groups. Touchscreen control.",
        ctaText: "See the RE Doppia",
      },
      es: {
        chapterLabel: "Capítulo 04",
        tagline: "Doble caldera. Grupos saturados. Control touchscreen.",
        ctaText: "Conoce la RE Doppia",
      },
    },
  },
  {
    id: "boxer-evo",
    brand: "Rocket Espresso",
    title: "Boxer Evo",
    watermark: "BOXER",
    href: "/products/boxer-evo",
    imageUrl: "/hero/boxer_evo.webp",
    lifestyleImageUrl: "/hero/boxer_evo_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 05",
        tagline: "Heat exchanger heritage, refined for the modern bar.",
        ctaText: "Meet the Boxer",
      },
      es: {
        chapterLabel: "Capítulo 05",
        tagline: "Herencia de intercambiador de calor, refinada para la barra moderna.",
        ctaText: "Conoce la Boxer",
      },
    },
  },
  {
    id: "spluga",
    brand: "Rocket Grinders",
    title: "Spluga",
    watermark: "SPLUGA",
    href: "/products/spluga",
    imageUrl: "/hero/spluga_grinder.webp",
    lifestyleImageUrl: "/hero/spluga_grinder_1.webp",
    i18n: {
      en: {
        chapterLabel: "Chapter 06",
        tagline: "Inspired by the Italian Alps. Engineered for the daily climb.",
        ctaText: "Discover Spluga",
      },
      es: {
        chapterLabel: "Capítulo 06",
        tagline: "Inspirado en los Alpes italianos. Ingeniería para el ascenso diario.",
        ctaText: "Descubre Spluga",
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
