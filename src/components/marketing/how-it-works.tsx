"use client";

import { Reveal } from "@/components/marketing/reveal";
import { FileText, Gauge, Download, ShieldCheck } from "lucide-react";

const steps = [
  { icon: FileText, title: "Fill the guided form", body: "Sections built for freshers — summary, experience, education, skills, projects." },
  { icon: Gauge, title: "Check your ATS score", body: "Get a 0–100 score with plain-language tips on what recruiters' software rejects." },
  { icon: Download, title: "Download & apply", body: "Export a clean, ATS-safe PDF and send it out. No account needed." },
];

export function HowItWorks() {
  return (
    <section className="shell py-20">
      <Reveal>
        <span className="eyebrow">How it works</span>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          <span className="hover-color">Three steps from blank page to interview-ready.</span>
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <div className="premium-card group h-full p-7">
              <span className="absolute right-5 top-4 text-5xl font-black text-[var(--text)]/[0.035] transition-colors group-hover:text-[var(--accent)]/[0.09]">
                0{i + 1}
              </span>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-grad)] text-white">
                <s.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="">
        <div className="premium-card mt-5 flex items-center gap-3 px-6 py-5 text-sm text-[var(--muted)]">
          <ShieldCheck size={18} className="text-[var(--accent-2)]" />
          Builder drafts stay in your browser. ATS uploads are processed for one analysis request and are not stored.
        </div>
      </Reveal>
    </section>
  );
}
