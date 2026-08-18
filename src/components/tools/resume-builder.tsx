"use client";

import { useEffect, useState } from "react";
import { Download, Save, CheckCircle2 } from "lucide-react";

type ResumeData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
};

const initialResume: ResumeData = {
  name: "Your Name",
  role: "Your Target Role",
  email: "you@example.com",
  phone: "+91 00000 00000",
  summary: "Write a concise professional summary focused on the role you want.",
  experience: "Company or project — Role\nDescribe what you built, improved, or delivered with measurable results.",
  education: "Degree — College or University\nGraduation year",
  skills: "Communication, Problem solving, JavaScript, React",
};

const storageKey = "resume-os-draft-v1";

export function ResumeBuilder() {
  const [resume, setResume] = useState(initialResume);
  const [saved, setSaved] = useState(false);
  const [template, setTemplate] = useState("modern");

  useEffect(() => {
    try {
      const draft = localStorage.getItem(storageKey);
      const selectedTemplate = localStorage.getItem("resume-os-template");
      if (draft) setResume({ ...initialResume, ...JSON.parse(draft) });
      if (selectedTemplate) setTemplate(selectedTemplate);
    } catch {
      // A blocked storage setting should not prevent the builder from working.
    }
  }, []);

  function update(field: keyof ResumeData, value: string) {
    setResume((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveDraft() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(resume));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch {
      setSaved(false);
    }
  }

  return (
    <section className="builder-page shell py-12 md:py-16">
      <div className="mb-8 max-w-2xl">
        <span className="eyebrow">Résumé builder</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Build while you preview.</h1>
        <p className="mt-3 text-[var(--muted)]">Your draft stays in this browser. Fill the form, save it locally, then print or save it as a PDF.</p>
      </div>

      <div className="builder-layout grid items-start gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="builder-controls premium-card p-5 md:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-field sm:col-span-2">
              <span>Full name</span>
              <input value={resume.name} onChange={(event) => update("name", event.target.value)} />
            </label>
            <label className="form-field sm:col-span-2">
              <span>Target role</span>
              <input value={resume.role} onChange={(event) => update("role", event.target.value)} />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input type="email" value={resume.email} onChange={(event) => update("email", event.target.value)} />
            </label>
            <label className="form-field">
              <span>Phone</span>
              <input value={resume.phone} onChange={(event) => update("phone", event.target.value)} />
            </label>
            <label className="form-field sm:col-span-2">
              <span>Professional summary</span>
              <textarea rows={4} value={resume.summary} onChange={(event) => update("summary", event.target.value)} />
            </label>
            <label className="form-field sm:col-span-2">
              <span>Experience or projects</span>
              <textarea rows={6} value={resume.experience} onChange={(event) => update("experience", event.target.value)} />
            </label>
            <label className="form-field sm:col-span-2">
              <span>Education</span>
              <textarea rows={4} value={resume.education} onChange={(event) => update("education", event.target.value)} />
            </label>
            <label className="form-field sm:col-span-2">
              <span>Skills, separated by commas</span>
              <input value={resume.skills} onChange={(event) => update("skills", event.target.value)} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={saveDraft} className="tool-button tool-button-primary">
              {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
              {saved ? "Saved" : "Save draft"}
            </button>
            <button type="button" onClick={() => window.print()} className="tool-button tool-button-secondary">
              <Download size={17} /> Print / save PDF
            </button>
          </div>
        </div>

        <div className={`resume-preview template-${template}`} aria-label="Live résumé preview">
          <header>
            <h2>{resume.name || "Your Name"}</h2>
            <p>{resume.role || "Your Target Role"}</p>
            <div>{[resume.email, resume.phone].filter(Boolean).join("  •  ")}</div>
          </header>

          <ResumeSection title="Profile" content={resume.summary} />
          <ResumeSection title="Experience & projects" content={resume.experience} />
          <ResumeSection title="Education" content={resume.education} />

          <section>
            <h3>Skills</h3>
            <div className="resume-skills">
              {resume.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function ResumeSection({ title, content }: { title: string; content: string }) {
  return (
    <section>
      <h3>{title}</h3>
      <p className="whitespace-pre-line">{content}</p>
    </section>
  );
}
