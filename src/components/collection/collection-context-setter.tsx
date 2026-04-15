"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setCollectionContext } from "@/components/navigation-tracker";

interface CollectionContextSetterProps {
  title: string;
}

export function CollectionContextSetter({ title }: CollectionContextSetterProps) {
  const pathname = usePathname();

  useEffect(() => {
    setCollectionContext(pathname, title);
  }, [pathname, title]);

  return null;
}
