"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EMPTY_RESUME,
  loadResume,
  saveResume,
  uid,
  type ResumeData,
  type ExperienceItem,
  type EducationItem,
  type ProjectItem,
} from "@/lib/resume-types";
import { scoreResume } from "@/lib/ats-engine";
import { ResumePreview } from "@/components/resume/resume-preview";

const TEMPLATES = [
  { id: "modern", name: "Modern", accent: "#14548a" },
  { id: "classic", name: "Classic", accent: "#1f1f1f" },
  { id: "compact", name: "Compact", accent: "#0d7a86" },
] as const;

function loadTemplate(): string {
  if (typeof window === "undefined") return "modern";
  return localStorage.getItem("resume-os-template") || "modern";
}

function Field({ label, value, onChange, placeholder, textarea }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
        />
      )}
    </label>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function BuilderPage() {
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME);
  const [loaded, setLoaded] = useState(false);
  const [template, setTemplate] = useState("modern");

  useEffect(() => {
    setData(loadResume());
    setTemplate(loadTemplate());
    setLoaded(true);
  }, []);

  function chooseTemplate(id: string) {
    setTemplate(id);
    try {
      localStorage.setItem("resume-os-template", id);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (loaded) saveResume(data);
  }, [data, loaded]);

  const result = useMemo(() => scoreResume(data), [data]);

  function set<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function addExp() {
    const item: ExperienceItem = { id: uid(), company: "", role: "", start: "", end: "", bullets: "" };
    setData((d) => ({ ...d, experience: [...d.experience, item] }));
  }
  function updExp(id: string, patch: Partial<ExperienceItem>) {
    setData((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }
  function delExp(id: string) {
    setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));
  }

  function addEdu() {
    const item: EducationItem = { id: uid(), school: "", degree: "", start: "", end: "" };
    setData((d) => ({ ...d, education: [...d.education, item] }));
  }
  function updEdu(id: string, patch: Partial<EducationItem>) {
    setData((d) => ({ ...d, education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }
  function delEdu(id: string) {
    setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));
  }

  function addProj() {
    const item: ProjectItem = { id: uid(), name: "", link: "", tech: "", bullets: "" };
    setData((d) => ({ ...d, projects: [...d.projects, item] }));
  }
  function updProj(id: string, patch: Partial<ProjectItem>) {
    setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }
  function delProj(id: string) {
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
  }

  return (
    <div className="shell grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_380px] builder-form">
      {/* FORM */}
      <div className="space-y-5 builder-form-col">
        <div>
          <span className="eyebrow">Résumé builder</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Fill the guided form</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Everything saves in your browser automatically. No login.
          </p>
        </div>

        <SectionCard title="Basics">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" value={data.fullName} onChange={(v) => set("fullName", v)} placeholder="Jane Doe" />
            <Field label="Headline" value={data.headline} onChange={(v) => set("headline", v)} placeholder="Fresher Web Developer" />
            <Field label="Email" value={data.email} onChange={(v) => set("email", v)} placeholder="jane@email.com" />
            <Field label="Phone" value={data.phone} onChange={(v) => set("phone", v)} placeholder="+91 00000 00000" />
            <Field label="Location" value={data.location} onChange={(v) => set("location", v)} placeholder="Bengaluru, India" />
            <Field label="Links (GitHub / LinkedIn)" value={data.links} onChange={(v) => set("links", v)} placeholder="github.com/jane" />
          </div>
          <Field label="Summary" value={data.summary} onChange={(v) => set("summary", v)} textarea placeholder="2-3 lines: who you are and what you're looking for." />
          <Field label="Skills (comma separated)" value={data.skills} onChange={(v) => set("skills", v)} placeholder="HTML, CSS, JavaScript, React, Git" />
        </SectionCard>

        <SectionCard title="Experience">
          {data.experience.map((e) => (
            <div key={e.id} className="space-y-2 rounded-xl border border-[var(--border)] p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Role" value={e.role} onChange={(v) => updExp(e.id, { role: v })} placeholder="Intern" />
                <Field label="Company" value={e.company} onChange={(v) => updExp(e.id, { company: v })} placeholder="Acme Pvt Ltd" />
                <Field label="Start" value={e.start} onChange={(v) => updExp(e.id, { start: v })} placeholder="Jun 2025" />
                <Field label="End" value={e.end} onChange={(v) => updExp(e.id, { end: v })} placeholder="Aug 2025" />
              </div>
              <Field label="Bullets (one per line)" value={e.bullets} onChange={(v) => updExp(e.id, { bullets: v })} textarea placeholder={"Built a dashboard that cut reporting time 40%\nAutomated weekly emails for 200 users"} />
              <button onClick={() => delExp(e.id)} className="text-xs text-red-400 hover:underline">Remove</button>
            </div>
          ))}
          <button onClick={addExp} className="rounded-lg border border-dashed border-[var(--accent)]/50 px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10">
            + Add experience
          </button>
        </SectionCard>

        <SectionCard title="Projects">
          {data.projects.map((p) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-[var(--border)] p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Project name" value={p.name} onChange={(v) => updProj(p.id, { name: v })} placeholder="Weather App" />
                <Field label="Link" value={p.link} onChange={(v) => updProj(p.id, { link: v })} placeholder="github.com/jane/weather" />
              </div>
              <Field label="Tech stack (e.g. Kotlin, Room DB, MVVM)" value={p.tech ?? ""} onChange={(v) => updProj(p.id, { tech: v })} placeholder="React, Node.js, PostgreSQL" />
              <Field label="Bullets (one per line)" value={p.bullets} onChange={(v) => updProj(p.id, { bullets: v })} textarea placeholder={"Fetches live data via REST API\nDeployed on Vercel"} />
              <button onClick={() => delProj(p.id)} className="text-xs text-red-400 hover:underline">Remove</button>
            </div>
          ))}
          <button onClick={addProj} className="rounded-lg border border-dashed border-[var(--accent)]/50 px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10">
            + Add project
          </button>
        </SectionCard>

        <SectionCard title="Education">
          {data.education.map((e) => (
            <div key={e.id} className="space-y-2 rounded-xl border border-[var(--border)] p-3">
              <Field label="School / College" value={e.school} onChange={(v) => updEdu(e.id, { school: v })} placeholder="XYZ University" />
              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="Degree" value={e.degree} onChange={(v) => updEdu(e.id, { degree: v })} placeholder="B.Tech CSE" />
                <Field label="Start" value={e.start} onChange={(v) => updEdu(e.id, { start: v })} placeholder="2022" />
                <Field label="End" value={e.end} onChange={(v) => updEdu(e.id, { end: v })} placeholder="2026" />
              </div>
              <button onClick={() => delEdu(e.id)} className="text-xs text-red-400 hover:underline">Remove</button>
            </div>
          ))}
          <button onClick={addEdu} className="rounded-lg border border-dashed border-[var(--accent)]/50 px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10">
            + Add education
          </button>
        </SectionCard>
      </div>

      {/* PREVIEW + SCORE (sticky) */}
      <aside className="lg:sticky lg:top-24 lg:h-fit space-y-5">
        <div className="no-print rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Live ATS score</div>
          <div className="my-1 text-5xl font-extrabold gradient-text">{result.score}</div>
          <div className="text-xs text-[var(--muted)]">out of 100</div>
          <ul className="mt-4 space-y-1.5 text-left">
            {result.tips.map((t) => (
              <li key={t.label} className="flex items-start gap-2 text-xs">
                <span className={t.status === "pass" ? "text-green-400" : t.status === "fail" ? "text-red-400" : "text-amber-400"}>
                  {t.status === "pass" ? "✓" : t.status === "fail" ? "×" : "!"}
                </span>
                <span><span className="font-semibold">{t.label}.</span> {t.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="no-print rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Template</div>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => chooseTemplate(t.id)}
                className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                  template === t.id
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="no-print flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-full bg-[var(--accent-grad)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/30 transition hover:opacity-90"
          >
            Download PDF
          </button>
          <button
            onClick={() => { setData(EMPTY_RESUME); }}
            className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--accent)]"
          >
            Clear
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-3 resume-paper-wrap">
          <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Live preview</div>
          <div className="overflow-hidden rounded-lg resume-paper-inner">
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      </aside>
    </div>
  );
}
