interface Review {
  text: string;
  author: string;
  role?: string;
}

interface ReviewsProps {
  eyebrow: string;
  reviews: Review[];
}

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-4" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-foreground"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews({ eyebrow, reviews }: ReviewsProps) {
  const featured = reviews[0];

  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <p className="text-[11px] uppercase tracking-[4px] font-medium text-muted text-center mb-10 md:mb-14 font-[family-name:var(--font-rajdhani)]">
          {eyebrow}
        </p>

        {/* Mobile: single featured quote, centered and refined */}
        {featured && (
          <figure className="md:hidden max-w-sm mx-auto text-center">
            <div className="flex justify-center">
              <StarRating />
            </div>
            <blockquote className="text-lg leading-relaxed text-foreground/85 font-[family-name:var(--font-rajdhani)] italic mb-6 px-2">
              &ldquo;{featured.text}&rdquo;
            </blockquote>
            <figcaption>
              <p className="text-sm font-semibold text-foreground">
                {featured.author}
              </p>
              {featured.role && (
                <p className="text-[10px] uppercase tracking-[2px] text-muted mt-1 font-[family-name:var(--font-rajdhani)]">
                  {featured.role}
                </p>
              )}
            </figcaption>
          </figure>
        )}

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 md:gap-12">
          {reviews.map((review) => (
            <div key={review.author} className="flex flex-col">
              <StarRating />
              <blockquote className="text-base leading-relaxed text-foreground/80 mb-6 flex-1">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {review.author}
                </p>
                {review.role && (
                  <p className="text-[11px] uppercase tracking-[2px] text-muted mt-1 font-[family-name:var(--font-rajdhani)]">
                    {review.role}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
