"use client";

import { useMemo, useState } from "react";
import { ScanSearch, Wand2, CheckCircle2, AlertCircle } from "lucide-react";

const stopWords = new Set([
  "and", "the", "with", "for", "that", "this", "from", "your", "you", "are", "will", "our", "have", "has", "job", "role", "work", "who", "but", "not", "all", "can", "their", "they", "its", "into", "using", "use",
]);

const exampleResume = `Software Developer\nExperience\nBuilt responsive React interfaces and improved page performance by 35%. Collaborated with designers and backend developers.\nProjects\nCreated a TypeScript dashboard with REST API integration and automated testing.\nEducation\nB.Tech in Computer Science\nSkills\nJavaScript, TypeScript, React, Git, REST APIs, testing`;

const exampleJob = `We are looking for a software developer with JavaScript, TypeScript and React experience. The candidate should understand REST APIs, Git, responsive design, automated testing and team collaboration.`;

type Result = {
  score: number;
  matched: string[];
  missing: string[];
  tips: string[];
};

function words(text: string) {
  return text.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) ?? [];
}

export function AtsChecker() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const canAnalyze = useMemo(() => resume.trim().length > 40 && job.trim().length > 40, [resume, job]);

  function analyze() {
    if (!canAnalyze) return;

    const resumeWords = new Set(words(resume));
    const frequency = new Map<string, number>();
    for (const word of words(job)) {
      if (!stopWords.has(word)) frequency.set(word, (frequency.get(word) ?? 0) + 1);
    }

    const keywords = [...frequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([word]) => word);
    const matched = keywords.filter((keyword) => resumeWords.has(keyword));
    const missing = keywords.filter((keyword) => !resumeWords.has(keyword));
    const keywordScore = keywords.length ? (matched.length / keywords.length) * 60 : 0;
    const sectionCount = ["experience", "education", "skills", "project"].filter((section) => resume.toLowerCase().includes(section)).length;
    const hasMetrics = /\b\d+(?:[.,]\d+)?%?\b/.test(resume);
    const hasActionVerbs = /\b(built|created|developed|improved|led|managed|designed|implemented|delivered|increased|reduced)\b/i.test(resume);
    const wordCount = words(resume).length;
    const lengthPoints = wordCount >= 80 && wordCount <= 900 ? 5 : wordCount >= 40 ? 3 : 0;
    const score = Math.round(Math.min(100, keywordScore + sectionCount * 5 + (hasMetrics ? 10 : 0) + (hasActionVerbs ? 5 : 0) + lengthPoints));

    const tips: string[] = [];
    if (missing.length) tips.push(`Add relevant missing terms naturally: ${missing.slice(0, 6).join(", ")}.`);
    if (sectionCount < 4) tips.push("Use clear Experience, Projects, Education, and Skills headings.");
    if (!hasMetrics) tips.push("Add measurable results such as percentages, time saved, users served, or project scale.");
    if (!hasActionVerbs) tips.push("Start achievement bullets with action verbs such as built, improved, led, or delivered.");
    if (wordCount < 80) tips.push("Add more role-relevant detail; the résumé is currently very short.");
    if (!tips.length) tips.push("Strong foundation. Proofread it and tailor the top achievements for this exact role.");

    setResult({ score, matched, missing, tips });
  }

  function loadExample() {
    setResume(exampleResume);
    setJob(exampleJob);
    setResult(null);
  }

  return (
    <section className="shell py-12 md:py-16">
      <div className="mb-8 max-w-2xl">
        <span className="eyebrow">ATS checker</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">See what the scanner sees.</h1>
        <p className="mt-3 text-[var(--muted)]">Compare résumé content with a job description using a transparent heuristic. File uploads are processed for the analysis request and are not stored.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="premium-card p-5 md:p-7">
          <label className="form-field">
            <span>Your résumé text</span>
            <textarea rows={12} value={resume} onChange={(event) => { setResume(event.target.value); setResult(null); }} placeholder="Paste your résumé here…" />
          </label>
          <label className="form-field mt-5">
            <span>Job description</span>
            <textarea rows={10} value={job} onChange={(event) => { setJob(event.target.value); setResult(null); }} placeholder="Paste the job description here…" />
          </label>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={analyze} disabled={!canAnalyze} className="tool-button tool-button-primary disabled:cursor-not-allowed disabled:opacity-45">
              <ScanSearch size={17} /> Analyze match
            </button>
            <button type="button" onClick={loadExample} className="tool-button tool-button-secondary">
              <Wand2 size={17} /> Try example
            </button>
          </div>
          {!canAnalyze && (resume || job) ? <p className="mt-3 text-xs text-[var(--muted)]">Add at least a few sentences to both fields to analyze them.</p> : null}
        </div>

        <div className="premium-card min-h-[440px] p-5 md:p-7" aria-live="polite">
          {result ? (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
                <div>
                  <p className="text-sm text-[var(--muted)]">Estimated ATS match</p>
                  <p className="mt-1 text-5xl font-bold gradient-text">{result.score}</p>
                </div>
                <div className="score-ring grid h-24 w-24 place-items-center rounded-full">
                  <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[var(--surface)] text-sm font-semibold">/ 100</div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} className="text-[var(--success)]" /> Matched keywords</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.matched.length ? result.matched.map((word) => <span key={word} className="keyword-chip keyword-match">{word}</span>) : <span className="text-sm text-[var(--muted)]">No strong matches yet.</span>}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="flex items-center gap-2 font-semibold"><AlertCircle size={18} className="text-amber-400" /> Fix next</h2>
                <ul className="mt-3 space-y-3 text-sm text-[var(--muted)]">
                  {result.tips.map((tip) => <li key={tip} className="flex gap-2"><span className="text-[var(--accent)]">•</span>{tip}</li>)}
                </ul>
              </div>
            </>
          ) : (
            <div className="grid min-h-[390px] place-items-center text-center">
              <div className="max-w-xs">
                <ScanSearch size={38} className="mx-auto text-[var(--accent)]" />
                <h2 className="mt-4 text-xl font-semibold">Your report appears here</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Paste both texts and click Analyze match for a score, matched keywords, and specific fixes.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
