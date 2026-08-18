import type { AtsStatus, StructuralCheck } from "./ats-types";

export function structuralCheck(
  id: StructuralCheck["id"],
  status: AtsStatus,
  label: string,
  detail: string,
  fix?: string,
  severity: StructuralCheck["severity"] = "medium",
): StructuralCheck {
  return { id, status, label, detail, fix, severity };
}

export function filenameCheck(filename: string): StructuralCheck {
  const base = filename.replace(/\.(pdf|docx)$/i, "");
  const goodPattern = /^[\p{L}][\p{L}'-]+(?:[_ -][\p{L}][\p{L}'-]+){1,4}[_ -](?:resume|cv)$/iu;
  const good = goodPattern.test(base);
  return structuralCheck(
    "filename",
    good ? "pass" : "warning",
    "Professional filename",
    good
      ? "The filename clearly identifies the candidate and document type."
      : "The filename is usable, but it may be unclear to a recruiter after download.",
    good ? undefined : "Rename it using a pattern such as FirstName_LastName_Resume.pdf.",
    "low",
  );
}

export function unusualCharacterCheck(text: string, fonts: string[]): StructuralCheck {
  const privateUse = text.match(/[\uE000-\uF8FF\u{F0000}-\u{FFFFD}]/gu)?.length ?? 0;
  const replacement = text.match(/\uFFFD/g)?.length ?? 0;
  const iconLike = text.match(/[★✓✔✦◆■●]/g)?.length ?? 0;
  const tooManyFonts = fonts.length > 5;
  const risky = privateUse + replacement > 0 || iconLike > 6 || tooManyFonts;
  return structuralCheck(
    "fonts-characters",
    risky ? "warning" : "pass",
    "Fonts and characters",
    risky
      ? `Potentially fragile glyphs or excessive font variation were detected${fonts.length ? ` across ${fonts.length} fonts` : ""}.`
      : `Text uses readable characters${fonts.length ? ` across ${fonts.length} detected font${fonts.length === 1 ? "" : "s"}` : ""}.`,
    risky ? "Replace icon fonts and decorative symbols with plain text, and use one or two standard fonts." : undefined,
    risky ? "medium" : "low",
  );
}

export function hasKeyContactOrSection(text: string): boolean {
  return /[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\d\s().-]{7,}\d)|\b(summary|experience|education|skills|projects?)\b/i.test(text);
}

function keyInformationSignals(text: string): Set<string> {
  const signals = new Set<string>();
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)) signals.add("email");
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(text)) signals.add("phone");
  for (const match of text.matchAll(/\b(summary|experience|education|skills|projects?)\b/gi)) {
    signals.add(match[1].toLowerCase().replace(/s$/, ""));
  }
  return signals;
}

export function hasKeyInformationOnlyAtEdge(edgeText: string, bodyText: string): boolean {
  const edgeSignals = keyInformationSignals(edgeText);
  const bodySignals = keyInformationSignals(bodyText);
  return [...edgeSignals].some((signal) => !bodySignals.has(signal));
}
