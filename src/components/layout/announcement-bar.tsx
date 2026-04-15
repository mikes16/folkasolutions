"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface AnnouncementBarProps {
  text: string;
  linkText: string;
  href: string;
  dismissLabel: string;
}

export function AnnouncementBar({ text, linkText, href, dismissLabel }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container-page flex items-center justify-center h-9 gap-2">
        <p className="text-[11px] tracking-[2px] uppercase font-medium font-[family-name:var(--font-rajdhani)]">
          {text}
          <Link
            href={href}
            className="ml-3 underline underline-offset-4 decoration-primary-foreground/40 hover:decoration-primary-foreground transition-colors duration-200"
          >
            {linkText}
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-4 p-1 opacity-50 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          aria-label={dismissLabel}
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    </div>
  );
}
