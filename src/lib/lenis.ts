import type Lenis from "lenis";

// Small singleton so non-provider components (e.g. the scroll overlay) can
// drive the same Lenis instance that powers smooth scrolling, without
// prop-drilling or a context re-render on every scroll frame.
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null): void {
  instance = l;
}

export function getLenis(): Lenis | null {
  return instance;
}
