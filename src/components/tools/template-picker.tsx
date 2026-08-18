"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ArrowRight } from "lucide-react";

const templates = [
  { id: "classic", name: "Classic", description: "Traditional, clean and familiar to recruiters.", accent: "#222222" },
  { id: "modern", name: "Modern", description: "A sharper hierarchy with a subtle indigo accent.", accent: "#5b4be8" },
  { id: "compact", name: "Compact", description: "Tighter spacing for candidates with more experience.", accent: "#087f8c" },
];

export function TemplatePicker() {
  const [selected, setSelected] = useState("modern");

  useEffect(() => {
    const saved = localStorage.getItem("resume-os-template");
    if (saved) setSelected(saved);
  }, []);

  function choose(id: string) {
    setSelected(id);
    localStorage.setItem("resume-os-template", id);
  }

  return (
    <section className="shell py-12 md:py-16">
      <div className="max-w-2xl">
        <span className="eyebrow">Templates</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Choose a recruiter-friendly layout.</h1>
        <p className="mt-3 text-[var(--muted)]">Every option stays single-column and ATS-safe. Your selection is used in the résumé builder.</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {templates.map((template) => (
          <button key={template.id} type="button" onClick={() => choose(template.id)} className={`template-card premium-card p-5 text-left ${selected === template.id ? "template-selected" : ""}`}>
            <div className="template-paper" style={{ "--template-accent": template.accent } as React.CSSProperties}>
              <div className="template-name-line" />
              <div className="template-role-line" />
              {[0, 1, 2].map((row) => <div key={row} className="template-row"><span /><span /></div>)}
            </div>
            <div className="mt-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{template.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{template.description}</p>
              </div>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${selected === template.id ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)]"}`}>
                {selected === template.id ? <Check size={15} /> : null}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Link href="/builder" className="tool-button tool-button-primary mt-8 inline-flex">
        Use selected template <ArrowRight size={17} />
      </Link>
    </section>
  );
}
