"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

export function VibeBox() {
  const ref = useRef<HTMLButtonElement>(null);
  const [on, setOn] = useState(false);

  function toggleVivid() {
    const root = document.documentElement;
    const next = !on;
    setOn(next);
    root.classList.toggle("vivid", next);

    // ONE-WAY play-once burst: runs once on click, then settles (no loop).
    const el = ref.current;
    if (el) {
      el.animate(
        next
          ? [
              { boxShadow: "0 0 0px rgba(196,77,255,0)", transform: "scale(1)" },
              { boxShadow: "0 0 48px 12px rgba(196,77,255,0.95)", transform: "scale(1.18)" },
              { boxShadow: "0 0 26px 5px rgba(0,240,255,0.7)", transform: "scale(1.04)" },
              { boxShadow: "0 0 16px 3px rgba(196,77,255,0.45)", transform: "scale(1)" },
            ]
          : [
              { boxShadow: "0 0 16px 3px rgba(196,77,255,0.45)", transform: "scale(1)" },
              { boxShadow: "0 0 0px rgba(196,77,255,0)", transform: "scale(0.92)" },
              { boxShadow: "0 0 0px rgba(196,77,255,0)", transform: "scale(1)" },
            ],
        { duration: 620, easing: "ease-out", iterations: 1 },
      );
    }
  }

  return (
    <motion.button
      ref={ref}
      onClick={toggleVivid}
      aria-pressed={on}
      aria-label="Toggle vivid mode"
      whileTap={{ scale: 0.86 }}
      className="group relative h-11 w-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--accent)]"
      style={{ boxShadow: on ? "0 0 16px 3px rgba(196,77,255,0.45)" : "0 0 0px rgba(196,77,255,0)" }}
    >
      {/* travelling light ring — shows on hover */}
      <span className="vibe-ring" aria-hidden />

      {/* inner glow that lights up on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(196,77,255,0.55), rgba(0,240,255,0.25) 55%, transparent 75%)",
          boxShadow: "inset 0 0 18px rgba(196,77,255,0.6)",
        }}
      />

      <span className="pointer-events-none absolute inset-0 rounded-xl bg-[var(--accent-grad)] opacity-0 transition group-hover:opacity-20" />
      <span className="pointer-events-none grid h-full w-full place-items-center">
        <span className="h-4 w-4 rounded-[5px] bg-[var(--accent-grad)] shadow-[0_0_12px_rgba(155,77,255,0.8)] transition group-hover:shadow-[0_0_18px_rgba(0,240,255,0.9)]" />
      </span>
    </motion.button>
  );
}
