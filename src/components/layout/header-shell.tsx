"use client";

import { useEffect, useState, type ReactNode } from "react";

// Sticky header wrapper that flips a "scrolled" flag once the page has moved
// past the top. The flag drives a subtle bottom border so the header edge is
// legible when it overlaps content — desert-white over desert-white would
// otherwise be invisible.
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className="sticky top-0 z-50 bg-header-bg/85 backdrop-blur-[12px] transition-[border-color,box-shadow] duration-300 border-b border-transparent data-[scrolled=true]:border-foreground/10"
    >
      {children}
    </header>
  );
}
