"use client";

import Link from "next/link";

interface Props {
  hasNextPage: boolean;
  nextCursor: string | null;
  currentCursor: string | null;
  basePath: string;
  labels: { previous: string; next: string };
}

/**
 * Shows prev/next links for the orders list.
 *
 * Cursor pagination is forward-only at the API layer. We don't keep a
 * back-stack of cursors, so "previous" simply jumps to the first page
 * (the `basePath` without a `?cursor`). It is rendered only when the user
 * already paginated forward, i.e. `currentCursor` is non-null.
 */
export function OrdersPagination({
  hasNextPage,
  nextCursor,
  currentCursor,
  basePath,
  labels,
}: Props) {
  if (!currentCursor && !hasNextPage) {
    // Single page of results, nothing to navigate.
    return null;
  }

  return (
    <nav
      className="flex items-center justify-between mt-12 pt-8 border-t border-foreground/15"
      aria-label="Pagination"
    >
      <div>
        {currentCursor ? (
          <Link
            href={basePath}
            className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[12px] text-foreground hover:text-foreground/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <span aria-hidden="true">&larr;</span> {labels.previous}
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
      <div>
        {hasNextPage && nextCursor ? (
          <Link
            href={`${basePath}?cursor=${encodeURIComponent(nextCursor)}`}
            className="font-[family-name:var(--font-rajdhani)] uppercase tracking-[0.15em] text-[12px] text-foreground hover:text-foreground/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {labels.next} <span aria-hidden="true">&rarr;</span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </nav>
  );
}
