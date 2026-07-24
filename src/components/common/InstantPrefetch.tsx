"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function InstantPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const prefetchedUrls = new Set<string>();

    const handlePointerOver = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only prefetch internal relative links or same-origin links
      if (
        (href.startsWith("/") || href.startsWith(window.location.origin)) &&
        !href.startsWith("#") &&
        !href.startsWith("http://") &&
        !href.startsWith("https://")
      ) {
        if (!prefetchedUrls.has(href)) {
          prefetchedUrls.add(href);
          router.prefetch(href);
        }
      }
    };

    // Listen to mouseover and touchstart globally
    document.addEventListener("mouseover", handlePointerOver, { passive: true });
    document.addEventListener("touchstart", handlePointerOver, { passive: true });

    return () => {
      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("touchstart", handlePointerOver);
    };
  }, [router]);

  return null;
}
