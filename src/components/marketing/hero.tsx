"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Check, FileCheck2, ScanSearch } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-24 md:pt-32">
      <div className="shell relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-chip mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-[var(--muted)]"
        >
          <Sparkles size={13} className="text-[var(--accent)]" /> 100% free · no login · works in your browser
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight md:text-7xl"
        >
          <span className="hover-color">Build a résumé that gets <span className="gradient-text">past the robots.</span></span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.04 }}
          className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted)]"
        >
          A guided builder for freshers and career-switchers. Craft a clean résumé, download a
          PDF, then check your ATS score and fix what holds you back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.08 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/builder"
            className="primary-cta inline-flex items-center gap-2 rounded-full bg-[var(--accent-grad)] bg-[length:200%_auto] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[var(--accent)]/30 transition hover:shadow-[var(--accent)]/50"
          >
            Start building <ArrowRight size={17} />
          </Link>
          <Link
            href="/ats"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/50 px-7 py-3.5 font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:shadow-[0_0_22px_rgba(124,92,255,0.45)] hover:bg-[var(--accent)]/10"
          >
            Check ATS score
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="hero-workspace premium-card mx-auto mt-16 max-w-4xl p-3 text-left md:p-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 pb-3 md:px-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#55d6a8]" />
            </div>
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Live résumé check
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--accent-2)]">
              <span className="status-dot" /> Saved locally
            </span>
          </div>

          <div className="grid gap-3 pt-3 md:grid-cols-[1.45fr_0.75fr]">
            <div className="resume-sheet rounded-xl p-6 md:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="h-3 w-36 rounded-full bg-[var(--text)]/85" />
                  <div className="mt-2 h-2 w-24 rounded-full bg-[var(--accent)]/65" />
                </div>
                <FileCheck2 className="text-[var(--accent)]" size={22} />
              </div>
              <div className="mt-7 space-y-5">
                {["Experience", "Projects", "Education"].map((label, index) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center gap-2 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                      <span>{label}</span>
                      <span className="h-px flex-1 bg-[var(--border)]" />
                    </div>
                    <div className="space-y-1.5">
                      <div className={`h-1.5 rounded-full bg-[var(--text)]/25 ${index === 1 ? "w-4/5" : "w-full"}`} />
                      <div className="h-1.5 w-11/12 rounded-full bg-[var(--text)]/15" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="score-panel flex flex-col justify-between rounded-xl p-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                  <ScanSearch size={15} className="text-[var(--accent)]" /> ATS compatibility
                </div>
                <div className="score-ring mx-auto my-6 grid h-28 w-28 place-items-center rounded-full">
                  <div className="grid h-[86px] w-[86px] place-items-center rounded-full bg-[var(--surface)]">
                    <span className="text-3xl font-bold tracking-tight">92</span>
                    <span className="-mt-5 text-[0.62rem] uppercase tracking-wider text-[var(--muted)]">Strong</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {["Clear structure", "Keywords matched", "ATS-safe format"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
