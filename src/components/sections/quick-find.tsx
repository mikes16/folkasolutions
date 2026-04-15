"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface Category {
  label: string;
  href: string;
}

interface QuickFindProps {
  heading: string;
  searchPlaceholder: string;
  categories: Category[];
}

export function QuickFind({
  heading,
  searchPlaceholder,
  categories,
}: QuickFindProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="bg-secondary py-12 md:py-16">
      <div className="container-page max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-foreground mb-8 font-[family-name:var(--font-rajdhani)]">
          {heading}
        </h2>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="relative mb-8">
          <label htmlFor="home-search" className="sr-only">
            {searchPlaceholder}
          </label>
          <Icon
            name="search"
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            id="home-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder + "..."}
            className="w-full pl-14 pr-6 py-4 bg-white rounded-full border-0 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </form>

        {/* Category pills */}
        <nav aria-label="Categories" className="flex flex-wrap justify-center gap-3">
          {categories.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="bg-white/70 hover:bg-white rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[2px] font-medium text-secondary-foreground transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
