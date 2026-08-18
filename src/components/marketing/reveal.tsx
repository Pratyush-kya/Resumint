"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Smooth, GPU-friendly reveal.
 * Unidirectional: boxes only rise vertically (translateY) while fading in.
 * No `filter: blur` / `scale` — those force repaints and cause the
 * scroll-time jank on the How-it-works (part 2) and Features (part 3) grids
 * where many boxes animate at once.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const style: CSSProperties = {
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
  };

  return (
    <motion.div
      style={style}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        delay: reduceMotion ? 0 : Math.min(delay, 0.12),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
