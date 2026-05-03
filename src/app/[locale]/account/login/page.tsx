import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

const KNOWN_ERRORS = [
  "missing_params",
  "session_expired",
  "state_mismatch",
  "token_exchange_failed",
  "access_denied",
] as const;

type KnownError = (typeof KNOWN_ERRORS)[number];

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;
  const t = await getTranslations({ locale, namespace: "account.login" });

  const errorKey: KnownError | null =
    error && (KNOWN_ERRORS as readonly string[]).includes(error)
      ? (error as KnownError)
      : null;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block bg-primary">
        <Image
          src="https://res.cloudinary.com/insightcollective/image/upload/f_auto,q_auto/folka/account/login-hero"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-90"
        />
      </div>

      <div className="flex flex-col justify-center px-8 py-20 md:px-16 bg-background">
        <p className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.25em] text-secondary text-xs mb-6">
          {t("eyebrow")}
        </p>
        <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-foreground mb-8">
          {t("title")}
        </h1>
        <p className="text-foreground/70 text-base leading-relaxed max-w-md mb-12">
          {t("body")}
        </p>

        {errorKey && (
          <div
            role="alert"
            className="border-l-[3px] border-[oklch(50%_0.18_28)] pl-4 py-3 mb-8"
          >
            <p className="text-sm text-[oklch(50%_0.18_28)]">
              {t(`errors.${errorKey}`)}
            </p>
          </div>
        )}

        <a
          href={`/api/auth/customer/login?locale=${locale}`}
          className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-primary/90 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground w-fit"
        >
          {t("cta")}
        </a>

        <p className="mt-6 text-xs text-foreground/50 max-w-md">{t("helper")}</p>
      </div>
    </div>
  );
}
