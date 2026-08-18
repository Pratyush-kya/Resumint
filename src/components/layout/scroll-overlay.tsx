"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";

/**
 * Smooth-scroll overlay: a glowing right-edge progress rail with a live
 * percentage. Driven by native scroll (Lenis makes the underlying scroll
 * itself smooth), and click-to-seek uses the same Lenis instance when present.
 */
export function ScrollOverlay() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    function progress(): number {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      return max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
    }

    function update() {
      const p = progress();
      const pct = Math.round(p * 100);
      if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
      if (thumbRef.current) thumbRef.current.style.top = `${p * 100}%`;
      if (labelRef.current) labelRef.current.textContent = `${pct}%`;

      const wrap = wrapRef.current;
      if (wrap) wrap.dataset.active = "true";
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        if (wrapRef.current) wrapRef.current.dataset.active = "false";
      }, 900);
    }

    function onClick(e: MouseEvent) {
      const track = e.currentTarget as HTMLElement;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const top = ratio * max;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(top, { duration: 1.1 });
      else window.scrollTo({ top, behavior: "smooth" });
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    const track = wrapRef.current?.querySelector<HTMLElement>(".scroll-overlay-track");
    track?.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      track?.removeEventListener("click", onClick);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div ref={wrapRef} className="scroll-overlay" aria-hidden="true">
      <span ref={labelRef} className="scroll-overlay-label">
        0%
      </span>
      <div className="scroll-overlay-track">
        <div ref={fillRef} className="scroll-overlay-fill" />
        <div ref={thumbRef} className="scroll-overlay-thumb" />
      </div>
    </div>
  );
}
