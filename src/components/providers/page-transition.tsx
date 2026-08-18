"use client";

import { ViewTransition } from "react";

/**
 * Wraps a page's content so route changes animate:
 *  - nav-forward (set on <Link transitionTypes>) -> content slides left
 *  - nav-back                                  -> content slides right
 *  - browser back/forward, untyped             -> soft crossfade
 *
 * The persistent site header is anchored separately in globals.css so it
 * never slides with the content. Layouts persist across navigations, so
 * this wrapper must live in each page.tsx (not the root layout).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-fade",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-fade",
      }}
      update="none"
      share="none"
    >
      {children}
    </ViewTransition>
  );
}
