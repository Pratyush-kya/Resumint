import { EMPTY_RESUME, type ResumeData } from "./resume-types";

const SECTION_HEADING = /^(summary|profile|objective|skills?|experience|employment|work history|projects?|education|certifications?|achievements?|awards?)\s*:?[\s-]*$/i;
const BULLET = /^\s*(?:[-*•●◦▪■▸►‣⁃]|\d+[.)])\s*/;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const LINK = /(?:https?:\/\/|www\.|linkedin\.com|github\.com)\S+/i;

export function normalizeResumeText(input: string): string {
  return (input || "")
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanBullet(line: string): string {
  return line.replace(BULLET, "").trim();
}

function sectionLines(lines: string[], names: RegExp): string[] {
  const start = lines.findIndex((line) => names.test(line.trim()));
  if (start < 0) return [];
  const result: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (SECTION_HEADING.test(line)) break;
    if (line) result.push(line);
  }
  return result;
}

export function resumeTextToData(input: string): ResumeData {
  const normalized = normalizeResumeText(input);
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const nonHeading = lines.filter((line) => !SECTION_HEADING.test(line));
  const email = normalized.match(EMAIL)?.[0] || "";
  const phone = normalized.match(PHONE)?.[0]?.trim() || "";
  const links = lines.filter((line) => LINK.test(line)).join(" | ");

  const identityLines = nonHeading.filter(
    (line) => !EMAIL.test(line) && !PHONE.test(line) && !LINK.test(line) && !BULLET.test(line),
  );
  const fullName = identityLines[0] || "";
  const headline = identityLines[1] || "";

  const explicitSummary = sectionLines(lines, /^(summary|profile|objective)\s*:?[\s-]*$/i);
  const fallbackSummary = identityLines.slice(2, 6);
  const summary = (explicitSummary.length ? explicitSummary : fallbackSummary).join(" ").slice(0, 1600);

  const explicitSkills = sectionLines(lines, /^skills?\s*:?[\s-]*$/i).join(", ");
  const inlineSkills = lines.find((line) => /^skills?\s*:/i.test(line))?.replace(/^skills?\s*:/i, "") || "";
  const skills = (explicitSkills || inlineSkills)
    .split(/[,;|•·]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .join(", ");

  const bullets = lines.filter((line) => BULLET.test(line)).map(cleanBullet).filter(Boolean);
  const location = nonHeading.find(
    (line) => /,/.test(line) && !EMAIL.test(line) && !PHONE.test(line) && !LINK.test(line),
  ) || "";

  return {
    ...EMPTY_RESUME,
    fullName,
    headline,
    email,
    phone,
    location,
    links,
    summary,
    skills,
    experience: bullets.length
      ? [{ id: "extracted", company: "", role: "", start: "", end: "", bullets: bullets.join("\n") }]
      : [],
  };
}

export function countResumeWords(text: string): number {
  return normalizeResumeText(text).match(/[\p{L}\p{N}][\p{L}\p{N}+#.'’-]*/gu)?.length ?? 0;
}

export function languageCalibrationNote(text: string): string | undefined {
  const words = normalizeResumeText(text).toLowerCase().match(/[a-z]{2,}/g) ?? [];
  if (words.length < 30) return undefined;
  const common = new Set(["the", "and", "with", "for", "from", "this", "that", "experience", "skills", "education", "project", "work", "developed", "built", "using"]);
  const hits = words.filter((word) => common.has(word)).length;
  if (hits / words.length < 0.015) {
    return "This résumé may not be primarily English. Content scoring is calibrated for English-language ATS conventions, but structural checks still apply.";
  }
  return undefined;
}

