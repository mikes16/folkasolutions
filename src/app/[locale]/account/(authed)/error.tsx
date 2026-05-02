"use client";

interface Props {
  error: Error;
  reset: () => void;
}

export default function AccountAuthedError({ reset }: Props) {
  return (
    <div className="py-16 max-w-md">
      <h1 className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.05em] text-2xl text-foreground mb-4">
        Something went wrong.
      </h1>
      <p className="text-foreground/70 mb-6">
        We couldn&apos;t load your dashboard. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-primary text-primary-foreground font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-sm hover:bg-primary/90 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Try again
      </button>
    </div>
  );
}
