"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  locale: string;
  labels: {
    dashboard: string;
    orders: string;
    profile: string;
    addresses: string;
    logout: string;
  };
}

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export function AccountSidebar({ locale, labels }: Props) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: `/${locale}/account`, label: labels.dashboard, exact: true },
    { href: `/${locale}/account/orders`, label: labels.orders },
    { href: `/${locale}/account/profile`, label: labels.profile },
    { href: `/${locale}/account/addresses`, label: labels.addresses },
  ];

  return (
    <aside className="lg:sticky lg:top-0 lg:h-screen lg:bg-primary lg:text-primary-foreground px-6 py-12">
      <h2 className="font-[family-name:var(--font-rajdhani)] text-[11px] uppercase tracking-[0.25em] text-secondary mb-8">
        {labels.dashboard.toUpperCase()}
      </h2>
      <nav>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block py-3 px-3 -mx-3 font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary ${
                    isActive
                      ? "border-l-[3px] border-secondary pl-[9px] text-primary-foreground"
                      : "text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="pt-6 mt-6 border-t border-primary-foreground/10">
            <form action="/api/auth/customer/logout" method="post">
              <button
                type="submit"
                className="block py-3 px-3 -mx-3 w-full text-left font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                {labels.logout}
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
