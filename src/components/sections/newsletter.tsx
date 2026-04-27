"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import posthog from "posthog-js";

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
    posthog.capture("newsletter_subscribed", {
      $set: { email },
    });
    setSubmitted(true);
  }

  return (
    <section className="bg-secondary py-24 md:py-32">
      <div className="container-page">
        <div className="grid md:grid-cols-2 gap-14 md:gap-20 items-end max-w-5xl mx-auto">
          <div>
            <p className="text-[11px] uppercase tracking-[4px] font-medium text-secondary-foreground/55 font-[family-name:var(--font-rajdhani)]">
              {eyebrow}
            </p>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-secondary-foreground font-[family-name:var(--font-rajdhani)] leading-[1.02]">
              {title}
            </h2>
            <p className="mt-6 text-[15px] text-secondary-foreground/65 leading-relaxed max-w-sm">
              {description}
            </p>
          </div>

          <div className="md:pb-2">
            {submitted ? (
              <p className="text-[15px] text-secondary-foreground/80 font-medium">
                {successMessage}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                  className="w-full bg-transparent border-0 border-b border-secondary-foreground/30 pt-3 pb-4 text-lg text-secondary-foreground placeholder:text-secondary-foreground/45 focus:outline-none focus:border-secondary-foreground transition-colors duration-300"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-3 self-start text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-secondary-foreground hover:gap-4 transition-all duration-300 cursor-pointer"
                >
                  {buttonText}
                  <Icon name="arrow-right" size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
