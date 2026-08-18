"use client";

import { Reveal } from "@/components/marketing/reveal";
import { LayoutTemplate, Wand2, Target, Eye, MousePointerClick, Lock } from "lucide-react";

const features = [
  { icon: LayoutTemplate, title: "ATS-safe templates", body: "Single-column, standard fonts, no graphics — the format recruiters' software actually parses.", span: "md:col-span-2" },
  { icon: Wand2, title: "Live preview", body: "See your résumé update as you type.", span: "" },
  { icon: Target, title: "Keyword matching", body: "Paste a job description and we score how well your résumé matches it.", span: "" },
  { icon: Eye, title: "Plain-language tips", body: "Every lost point comes with a specific, fixable suggestion — not vague advice.", span: "md:col-span-2" },
  { icon: MousePointerClick, title: "One-click PDF", body: "Download a print-ready file instantly from your browser.", span: "" },
  { icon: Lock, title: "Private by design", body: "No login. Uploaded résumés are processed for your analysis and are not stored.", span: "" },
];

export function Features() {
  return (
    <section className="shell py-20">
      <Reveal>
        <span className="eyebrow">Features</span>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          <span className="hover-color">Everything a first résumé needs — and nothing it doesn&apos;t.</span>
        </h2>
      </Reveal>

      <div className="mt-10 grid auto-rows-[1fr] gap-5 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.05} className={f.span}>
            <div className="premium-card group flex h-full flex-col p-7">
              <div className="card-icon mb-4 grid h-10 w-10 place-items-center rounded-lg text-[var(--accent)]">
                <f.icon size={19} />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
