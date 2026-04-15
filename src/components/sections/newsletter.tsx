"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

interface NewsletterProps {
  eyebrow: string;
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
}

export function Newsletter({
  eyebrow,
  title,
  description,
  placeholder,
  buttonText,
  successMessage,
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire to Shopify customer or Klaviyo
    setSubmitted(true);
  }

  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container-page max-w-2xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[4px] font-medium text-secondary-foreground/50 mb-5 font-[family-name:var(--font-rajdhani)]">
          {eyebrow}
        </p>
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-secondary-foreground mb-4 font-[family-name:var(--font-rajdhani)]">
          {title}
        </h2>
        <p className="text-sm md:text-base text-secondary-foreground/60 leading-relaxed mb-10 max-w-md mx-auto">
          {description}
        </p>

        {submitted ? (
          <p className="text-sm font-medium text-secondary-foreground/80">
            {successMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">
              {placeholder}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-5 py-3.5 bg-white rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            <button
              type="submit"
              className="shrink-0 bg-primary text-primary-foreground rounded-full px-6 py-3.5 text-[11px] uppercase tracking-[2px] font-medium hover:opacity-90 transition-opacity duration-300 flex items-center gap-2"
            >
              {buttonText}
              <Icon name="arrow-right" size={14} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
