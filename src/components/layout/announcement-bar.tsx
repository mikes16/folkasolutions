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
    <div className="relative bg-background border-b border-foreground/10">
      <div className="container-page flex items-center justify-center h-9 gap-2">
        <p className="text-[10px] tracking-[3px] uppercase font-medium font-[family-name:var(--font-rajdhani)] text-foreground/75">
          {text}
          <Link
            href={href}
            className="ml-3 underline underline-offset-4 decoration-foreground/25 hover:decoration-foreground transition-colors duration-200"
          >
            {linkText}
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-4 p-1 text-foreground/35 hover:text-foreground/80 transition-colors duration-200 cursor-pointer"
          aria-label={dismissLabel}
        >
          <Icon name="close" size={12} />
        </button>
      </div>
    </div>
  );
}
