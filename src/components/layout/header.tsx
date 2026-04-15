import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { mainMenu } from "@/lib/menu";
import { CartButton, LocaleSwitcher } from "./header-actions";
import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";
import { AnnouncementBar } from "./announcement-bar";

export async function Header() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-50 bg-header-bg/85 backdrop-blur-[12px] transition-shadow duration-300">
      <AnnouncementBar
        text={t("announcement.text")}
        linkText={t("announcement.linkText")}
        href="/collections/sale"
        dismissLabel={t("announcement.dismiss")}
      />
      <div className="container-page">
        <div className="flex items-center justify-between h-[70px]">
          {/* Left: hamburger (mobile) | logo + nav (desktop) */}
          <div className="flex items-center gap-8">
            <MobileMenu items={mainMenu} />

            <Link href="/" className="shrink-0" aria-label="Folka Coffee Solutions">
              <Image
                src="/logos/logo.webp"
                alt="Folka Coffee Solutions"
                width={267}
                height={83}
                priority
                className="h-9 w-auto"
              />
            </Link>

            <DesktopNav items={mainMenu} />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <LocaleSwitcher />

            <Link
              href="/search"
              className="p-2 text-foreground/65 hover:text-foreground transition-opacity duration-300 hidden lg:flex"
            >
              <Icon name="search" size={18} />
              <span className="sr-only">{t("common.search")}</span>
            </Link>

            <a
              href="https://cafe-folka.myshopify.com/account"
              className="p-2 text-foreground/65 hover:text-foreground transition-opacity duration-300 hidden lg:flex"
            >
              <Icon name="user" size={18} />
              <span className="sr-only">{t("common.account")}</span>
            </a>

            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
