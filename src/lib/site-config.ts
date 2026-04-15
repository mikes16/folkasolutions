// Site-wide contact and social configuration.
// All values resolve from NEXT_PUBLIC_* env vars at build time so they're
// available in both server and client components. Defaults below are
// placeholders — override via .env.local for real values.

export const siteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://folkasolutions.com",
  whatsapp: {
    general: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "528112345678",
    service:
      process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_NUMBER ??
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
      "528112345678",
  },
  email: {
    contact: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@folkasolutions.com",
    commercial:
      process.env.NEXT_PUBLIC_COMMERCIAL_EMAIL ??
      "comercial@folkasolutions.com",
  },
  social: {
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
      "https://www.instagram.com/folkasolutions/",
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ??
      "https://www.linkedin.com/company/folkaforeveryone/",
  },
} as const;

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
