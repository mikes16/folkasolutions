"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Review {
  text: string;
  author: string;
  role?: string;
  videoUrl?: string;
  image?: string;
  cafeName?: string;
}

interface ReviewsProps {
  eyebrow: string;
  reviews: Review[];
}

// Editorial dark-cinema section. Midnight Blue full-bleed, Desert White type,
// Mineral Sand accents. Video stays crisp against the dark field rather than
// fading into the background — presence over softness. Navigation is an
// explicit numbered list of authors plus prev/next controls.
export function Reviews({ eyebrow, reviews }: ReviewsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = reviews[activeIndex];
  const hasAnyVideo = reviews.some((r) => !!r.videoUrl);

  if (!active) return null;

  return (
    <section
      className="py-16 md:py-20 lg:py-24"
      style={{
        backgroundColor: "var(--folka-midnight-blue)",
        color: "var(--folka-desert-white)",
      }}
    >
      <div className="container-page">
        <div className="max-w-[1280px] mx-auto">
          {hasAnyVideo ? (
            <SplitLayout
              key={activeIndex}
              review={active}
              eyebrow={eyebrow}
              indexLabel={String(activeIndex + 1).padStart(2, "0")}
            />
          ) : (
            <PullQuote key={activeIndex} review={active} eyebrow={eyebrow} />
          )}

          {reviews.length > 1 && (
            <Nav
              reviews={reviews}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes reviews-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

// Cinematic split: 9:16 video on the left, quote + attribution on the right.
// Flex-row (not grid) so the video occupies its natural width and the quote
// fills the rest — no reserved-but-empty column space. Items align to the
// top with a deliberate editorial offset on the quote side (pull-quote rides
// slightly below the video's top edge like a magazine spread).
function SplitLayout({
  review,
  eyebrow,
  indexLabel,
}: {
  review: Review;
  eyebrow: string;
  indexLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-12 lg:gap-16 motion-safe:animate-[reviews-fade_600ms_cubic-bezier(0.16,1,0.3,1)]">
      {/* Video — natural size (driven by viewport-height cap + aspect ratio) */}
      <div className="shrink-0 mx-auto md:mx-0">
        {review.videoUrl ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={`Play testimonial from ${review.author}`}
            className="group relative block cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2"
            style={{
              aspectRatio: "9 / 16",
              height: "min(58vh, 520px)",
              width: "auto",
              maxWidth: "100%",
              boxShadow:
                "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(181,168,138,0.08) inset",
              // @ts-expect-error CSS custom props
              "--tw-ring-color": "var(--folka-mineral-sand)",
            }}
          >
            <video
              key={review.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              poster={review.image}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.015]"
            >
              <source src={review.videoUrl} />
            </video>

            {/* Subtle bottom vignette — integrates video into the dark section
                without dissolving its edges */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(16,28,46,0.55) 0%, rgba(16,28,46,0) 45%)",
              }}
            />

            {/* Play affordance — outline-only, hidden until hover. Video is
                autoplay muted loop; this button opens the fullscreen lightbox
                with audio, so it only needs to surface on user intent. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{
                  border: "1px solid rgba(242,237,227,0.7)",
                  color: "var(--folka-desert-white)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 md:w-5 md:h-5 translate-x-[1px]"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>

            {/* Editorial microlabel, bottom-left */}
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[3px] font-[family-name:var(--font-rajdhani)] font-medium"
              style={{ color: "rgba(242,237,227,0.85)" }}
            >
              Ver · Watch
            </span>
          </button>
        ) : review.image ? (
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "9 / 16",
              height: "min(58vh, 520px)",
              width: "auto",
              maxWidth: "100%",
            }}
          >
            <Image
              src={review.image}
              alt={review.author}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 60vw, 30vw"
            />
          </div>
        ) : null}
      </div>

      {/* Quote + attribution — flex-1 to fill remaining space, padded down
          from the top so it sits like a magazine pull-quote (not dead-center).
          Relative so the large index watermark can anchor to its bottom-right
          and fill the orphan whitespace below the author block. */}
      <figure className="flex-1 md:pt-8 lg:pt-16 max-w-[640px] relative">
        {/* Eyebrow paired with slide index — labels the pull-quote as part
            of a numbered sequence. Rhymes with the Nav numbering below. */}
        <p className="flex items-baseline gap-2.5 text-[11px] uppercase tracking-[4px] font-medium mb-8 md:mb-10 font-[family-name:var(--font-rajdhani)]">
          <span style={{ color: "var(--folka-mineral-sand)" }}>{indexLabel}</span>
          <span style={{ color: "rgba(242,237,227,0.25)" }}>/</span>
          <span style={{ color: "rgba(242,237,227,0.75)" }}>{eyebrow}</span>
        </p>

        {/* Pull-quote glyph — oversized editorial accent, hung tight to the
            quote baseline. Light weight matches the blockquote type. */}
        <span
          aria-hidden="true"
          className="block font-[family-name:var(--font-rajdhani)] select-none -ml-1"
          style={{
            color: "var(--folka-mineral-sand)",
            fontSize: "clamp(8rem, 12vw, 11rem)",
            lineHeight: 0.55,
            fontWeight: 300,
            opacity: 0.9,
          }}
        >
          &ldquo;
        </span>
        <blockquote
          className="text-xl md:text-2xl lg:text-[2.125rem] leading-[1.25] tracking-tight font-[family-name:var(--font-rajdhani)] -mt-5 md:-mt-8 relative z-10"
          style={{ color: "var(--folka-desert-white)", fontWeight: 300 }}
        >
          {review.text}
        </blockquote>
        <figcaption className="flex flex-col mt-10 md:mt-14 relative z-10">
          <span
            aria-hidden="true"
            className="block h-px w-10 mb-6"
            style={{ backgroundColor: "rgba(242,237,227,0.25)" }}
          />
          <p
            className="text-sm md:text-base font-semibold"
            style={{ color: "var(--folka-desert-white)" }}
          >
            {review.author}
          </p>
          {(review.role || review.cafeName) && (
            <p
              className="text-[11px] uppercase tracking-[2.5px] mt-1.5 font-[family-name:var(--font-rajdhani)]"
              style={{ color: "var(--folka-mineral-sand)" }}
            >
              {[review.role, review.cafeName].filter(Boolean).join(" · ")}
            </p>
          )}
        </figcaption>

        {indexLabel && (
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute right-0 bottom-0 font-[family-name:var(--font-rajdhani)] leading-[0.8]"
            style={{
              color: "var(--folka-desert-white)",
              opacity: 0.06,
              fontWeight: 300,
              fontSize: "clamp(7rem, 14vw, 13rem)",
              letterSpacing: "-0.06em",
              transform: "translateY(20%)",
            }}
          >
            {indexLabel}
          </span>
        )}
      </figure>

      {review.videoUrl && isOpen && (
        <VideoLightbox
          src={review.videoUrl}
          poster={review.image}
          label={review.author}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Navigation: numbered author list as table-of-contents. Names ARE the
// buttons — no redundant prev/next arrows. Active state is typographic
// (full opacity + Mineral Sand author name) rather than an underline, so
// it doesn't duplicate the hairline rule above.
function Nav({
  reviews,
  activeIndex,
  onSelect,
}: {
  reviews: Review[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className="mt-10 md:mt-12 pt-6 border-t"
      style={{ borderColor: "rgba(242,237,227,0.15)" }}
    >
      <ol className="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 md:gap-x-10">
        {reviews.map((r, i) => {
          const isActive = i === activeIndex;
          const num = String(i + 1).padStart(2, "0");
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-baseline gap-3 text-left transition-colors duration-300 focus:outline-none cursor-pointer"
              >
                <span
                  className="text-[11px] tracking-[2px] font-[family-name:var(--font-rajdhani)] font-medium transition-colors"
                  style={{
                    color: isActive
                      ? "var(--folka-mineral-sand)"
                      : "rgba(242,237,227,0.4)",
                  }}
                >
                  {num}
                </span>
                <span
                  className="text-sm md:text-[13px] uppercase tracking-[2.5px] font-[family-name:var(--font-rajdhani)] transition-colors"
                  style={{
                    color: isActive
                      ? "var(--folka-desert-white)"
                      : "rgba(242,237,227,0.45)",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {r.author}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Fullscreen lightbox — native controls, audio on, ESC/backdrop to close.
function VideoLightbox({
  src,
  poster,
  label,
  onClose,
}: {
  src: string;
  poster?: string;
  label: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    // Attempt audio playback; browsers may block until user gesture, which
    // the click that opened the modal should satisfy.
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      v.play().catch(() => {});
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Testimonial from ${label}`}
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md p-4 md:p-8 motion-safe:animate-[reviews-fade_300ms_ease-out]"
      style={{ backgroundColor: "rgba(16,28,46,0.95)" }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center justify-center w-11 h-11 rounded-full transition-colors focus:outline-none"
        style={{
          backgroundColor: "rgba(242,237,227,0.1)",
          color: "var(--folka-desert-white)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] max-w-full aspect-[9/16] h-auto w-auto object-contain rounded-lg shadow-2xl"
      />
    </div>
  );
}

// Fallback layout: single dominant pull-quote with optional circular portrait.
function PullQuote({ review, eyebrow }: { review: Review; eyebrow: string }) {
  return (
    <figure className="motion-safe:animate-[reviews-fade_600ms_cubic-bezier(0.16,1,0.3,1)]">
      <p
        className="text-[11px] uppercase tracking-[4px] font-medium mb-8 md:mb-10 font-[family-name:var(--font-rajdhani)]"
        style={{ color: "var(--folka-mineral-sand)" }}
      >
        {eyebrow}
      </p>
      <span
        aria-hidden="true"
        className="block font-[family-name:var(--font-rajdhani)] select-none"
        style={{
          color: "var(--folka-mineral-sand)",
          fontSize: "clamp(9rem, 16vw, 14rem)",
          lineHeight: 0.55,
          fontWeight: 300,
          opacity: 0.9,
        }}
      >
        &ldquo;
      </span>
      <blockquote
        className="text-2xl md:text-4xl lg:text-5xl leading-[1.2] tracking-tight font-[family-name:var(--font-rajdhani)] max-w-4xl -mt-4 md:-mt-6"
        style={{ color: "var(--folka-desert-white)", fontWeight: 300 }}
      >
        {review.text}
      </blockquote>
      <figcaption className="flex items-center gap-4 mt-10 md:mt-14">
        {review.image && (
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0">
            <Image
              src={review.image}
              alt={review.author}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        )}
        <div className="flex flex-col">
          <p
            className="text-sm md:text-base font-semibold"
            style={{ color: "var(--folka-desert-white)" }}
          >
            {review.author}
          </p>
          {(review.role || review.cafeName) && (
            <p
              className="text-[11px] uppercase tracking-[2.5px] mt-0.5 font-[family-name:var(--font-rajdhani)]"
              style={{ color: "var(--folka-mineral-sand)" }}
            >
              {[review.role, review.cafeName].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
