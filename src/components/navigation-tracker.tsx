"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const CURRENT_KEY = "folka_nav_current";
const PREVIOUS_KEY = "folka_nav_previous";
const COLLECTION_CONTEXT_KEY = "folka_collection_context";

export interface CollectionContext {
  path: string;
  title: string;
}

export function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = sessionStorage.getItem(CURRENT_KEY);
    if (prev && prev !== pathname) {
      sessionStorage.setItem(PREVIOUS_KEY, prev);
    }
    sessionStorage.setItem(CURRENT_KEY, pathname);
  }, [pathname]);

  return null;
}

export function getPreviousPath(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PREVIOUS_KEY);
}

export function setCollectionContext(path: string, title: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    COLLECTION_CONTEXT_KEY,
    JSON.stringify({ path, title })
  );
}

export function getCollectionContext(): CollectionContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(COLLECTION_CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CollectionContext;
  } catch {
    return null;
  }
}
