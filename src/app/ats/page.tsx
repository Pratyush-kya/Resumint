"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  LoaderCircle,
  ScanSearch,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { scoreResume } from "@/lib/ats-engine";
import type { AtsStatus, AtsTip, StructuralCheck, UploadAnalysisResponse } from "@/lib/ats-types";
import { normalizeResumeText, resumeTextToData } from "@/lib/resume-text";
import { sniffResumeFile } from "@/lib/upload-validation";

type InputMode = "upload" | "paste";

interface PasteAnalysis {
  score: number;
  normalizedText: string;
  content: UploadAnalysisResponse["content"];
}

const statusOrder: Record<AtsStatus, number> = { fail: 0, warning: 1, pass: 2 };

function statusTone(status: AtsStatus): string {
  if (status === "pass") return "text-green-400";
  if (status === "fail") return "text-red-400";
  return "text-amber-400";
}

function statusIcon(status: AtsStatus) {
  if (status === "pass") return "✓";
  if (status === "fail") return "×";
  return "!";
}

function FeedbackItem({ item }: { item: AtsTip | StructuralCheck }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)]/45 p-3">
      <span className={`mt-0.5 font-bold ${statusTone(item.status)}`}>{statusIcon(item.status)}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{item.label}</p>
        <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
        {item.fix ? <p className="mt-1 text-xs leading-5"><span className="font-semibold text-[var(--accent)]">Fix:</span> {item.fix}</p> : null}
      </div>
    </li>
  );
}

export default function AtsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<InputMode>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadAnalysisResponse | null>(null);
  const [pasteResult, setPasteResult] = useState<PasteAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showJobNudge, setShowJobNudge] = useState(false);

  const activeResult = mode === "upload" ? uploadResult : pasteResult;

  function resetResults() {
    setUploadResult(null);
    setPasteResult(null);
    setError("");
  }

  function chooseMode(nextMode: InputMode) {
    setMode(nextMode);
    setError("");
    setShowJobNudge(false);
  }

  async function acceptFile(file?: File) {
    if (!file) return;
    setError("");
    setUploadResult(null);
    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const validation = sniffResumeFile(header, file.name, file.size);
    if (!validation.ok) {
      setSelectedFile(null);
      setError(validation.error || "Choose a valid PDF or DOCX résumé.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
  }

  function removeFile() {
    setSelectedFile(null);
    setUploadResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyze() {
    setError("");
    setShowJobNudge(!jobText.trim());
    if (mode === "paste") {
      const normalizedText = normalizeResumeText(resumeText);
      if (!normalizedText) {
        setError("Paste your résumé text before running the check.");
        return;
      }
      const data = resumeTextToData(normalizedText);
      const content = scoreResume(data, jobText, normalizedText);
      setPasteResult({ score: content.score, normalizedText, content });
      return;
    }

    if (!selectedFile) {
      setError("Choose a PDF or DOCX résumé before running the check.");
      return;
    }
    setLoading(true);
    setUploadResult(null);
    try {
      const body = new FormData();
      body.append("resume", selectedFile);
      body.append("jobDescription", jobText);
      const response = await fetch("/api/ats/extract", { method: "POST", body });
      const payload = await response.json() as UploadAnalysisResponse | { error?: string };
      if (!response.ok || !("score" in payload)) {
        throw new Error("error" in payload && payload.error ? payload.error : "The résumé could not be analyzed.");
      }
      setUploadResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The résumé could not be analyzed. Try paste text instead.");
    } finally {
      setLoading(false);
    }
  }

  const structuralChecks = uploadResult
    ? [...uploadResult.structural.checks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    : [];
  const contentTips = activeResult
    ? [...activeResult.content.tips].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    : [];

  return (
    <div className="shell grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <div className="space-y-5">
        <div>
          <span className="eyebrow">ATS checker</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Check the file recruiters will receive</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Upload a PDF or DOCX to check both job fit and structural parsing risks. Your résumé is processed for this request and is not stored.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-1" role="tablist" aria-label="Résumé input method">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "upload"}
              onClick={() => chooseMode("upload")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "upload" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--muted)]"}`}
            >
              <UploadCloud size={16} /> Upload file
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "paste"}
              onClick={() => chooseMode("paste")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "paste" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--muted)]"}`}
            >
              <FileText size={16} /> Paste text
            </button>
          </div>

          {mode === "upload" ? (
            <div>
              <label
                className={`block cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition ${dragging ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] bg-[var(--bg-soft)]/45 hover:border-[var(--accent)]/70"}`}
                onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void acceptFile(event.dataTransfer.files[0]);
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={(event) => void acceptFile(event.target.files?.[0])}
                />
                <UploadCloud size={30} className="mx-auto text-[var(--accent)]" />
                <p className="mt-3 font-semibold">Drop your résumé here or click to browse</p>
                <p className="mt-1 text-xs text-[var(--muted)]">PDF or DOCX only · maximum 5MB</p>
              </label>

              {selectedFile ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={20} className="shrink-0 text-[var(--accent)]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{selectedFile.name}</p>
                      <p className="text-xs text-[var(--muted)]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeFile} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-red-400">
                    <X size={14} /> Remove / replace
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <label htmlFor="resume-text" className="mb-1 block text-xs font-semibold text-[var(--muted)]">Your résumé text</label>
              <textarea
                id="resume-text"
                value={resumeText}
                onChange={(event) => { setResumeText(event.target.value); resetResults(); }}
                rows={13}
                placeholder={"Jane Doe\nSoftware Developer\nEmail and phone\n\nSummary\n...\n\nSkills\nJavaScript, React, Git\n\nExperience\n- Built a dashboard that reduced reporting time by 40%"}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              />
              <p className="mt-2 text-xs text-[var(--muted)]">Paste mode checks content only. Upload the original file to detect columns, tables, text boxes, and missing text layers.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <label htmlFor="job-description" className="mb-1 block text-xs font-semibold text-[var(--muted)]">
            Job description <span className="text-[var(--accent)]">(strongly recommended)</span>
          </label>
          <p className="mb-3 text-xs leading-5 text-[var(--muted)]">Without it, we can check general résumé quality and formatting, but not your fit for this specific role.</p>
          <textarea
            id="job-description"
            value={jobText}
            onChange={(event) => { setJobText(event.target.value); resetResults(); setShowJobNudge(false); }}
            rows={7}
            placeholder="Paste the complete job posting here to compare role keywords…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {showJobNudge ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            Add the job description for a more accurate match score. You can still continue with the general check.
          </div>
        ) : null}
        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100" role="alert">
            <AlertCircle size={17} className="mt-0.5 shrink-0" /> {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void analyze()}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent-grad)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? <><LoaderCircle size={18} className="animate-spin" /> Reading your résumé...</> : <><ScanSearch size={18} /> Run ATS check</>}
        </button>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit" aria-live="polite">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Unified ATS score</div>
          <div className="my-1 text-6xl font-extrabold gradient-text">{activeResult ? activeResult.score : "—"}</div>
          <div className="text-xs text-[var(--muted)]">out of 100</div>
          {uploadResult ? (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[var(--bg-soft)] p-2"><span className="block text-[var(--muted)]">Content / role</span><strong>{uploadResult.content.score}</strong></div>
              <div className="rounded-lg bg-[var(--bg-soft)] p-2"><span className="block text-[var(--muted)]">Parseability</span><strong>{uploadResult.structural.score}</strong></div>
            </div>
          ) : pasteResult ? <p className="mt-3 text-xs text-[var(--muted)]">Content score only — upload the file for structural checks.</p> : null}
        </div>

        {uploadResult ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div>
                <h2 className="text-sm font-bold">File parsed successfully</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {uploadResult.file.name} · {uploadResult.file.wordCount} words{uploadResult.file.pageCount ? ` · ${uploadResult.file.pageCount} page${uploadResult.file.pageCount === 1 ? "" : "s"}` : ""}
                </p>
              </div>
            </div>
            {uploadResult.languageNote ? <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">{uploadResult.languageNote}</p> : null}
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer font-semibold text-[var(--accent)]">Review extracted text</summary>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--bg-soft)] p-3 font-sans leading-5 text-[var(--muted)]">{uploadResult.normalizedText}</pre>
            </details>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
            {activeResult ? <CheckCircle2 size={16} /> : <ScanSearch size={16} />} What to fix
          </h2>
          {activeResult ? (
            <div className="space-y-5">
              {uploadResult ? (
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--accent)]">File structure</h3>
                  <ul className="space-y-2">{structuralChecks.map((check) => <FeedbackItem key={check.id} item={check} />)}</ul>
                </section>
              ) : null}
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Content and role fit</h3>
                <ul className="space-y-2">{contentTips.map((tip) => <FeedbackItem key={tip.label} item={tip} />)}</ul>
              </section>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">Upload your original résumé or use paste text, then run the check to see prioritized fixes.</p>
          )}
        </div>

        {activeResult && jobText.trim() ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Keyword match — {activeResult.content.keywordScore}/100</h2>
            <div className="flex flex-wrap gap-2">
              {activeResult.content.keywordMatches.map((keyword) => (
                <span key={keyword.term} className={`rounded-full px-2.5 py-1 text-xs ${keyword.found ? "bg-green-500/15 text-green-300" : "bg-white/5 text-[var(--muted)]"}`}>
                  {keyword.found ? "✓ " : "• "}{keyword.term}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

