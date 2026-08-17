"use client";

import { useNow } from "@/lib/use-now";

const BUILD_YEAR = new Date().getFullYear();

/**
 * Renders the current year on the client.
 *
 * The footer lives in statically prerendered pages, so a plain
 * `new Date().getFullYear()` would freeze the build-time year into the HTML
 * and go stale on 1 January. Falling back to the build year keeps the server
 * and first client render identical, then it corrects itself after hydration.
 */
export default function CopyrightYear() {
  const now = useNow();
  return <>{now ? now.getFullYear() : BUILD_YEAR}</>;
}
