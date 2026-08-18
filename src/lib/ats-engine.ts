import type { ResumeData } from "./resume-types";
import type { AtsResult, AtsTip, StructuralCheck, StructuralResult } from "./ats-types";

export type { AtsResult, AtsTip, AtsStatus, StructuralCheck, StructuralResult } from "./ats-types";

const ACTION_VERBS = [
  "led", "built", "created", "designed", "developed", "implemented", "launched",
  "managed", "improved", "increased", "reduced", "delivered", "automated", "optimized",
  "analyzed", "researched", "organized", "coordinated", "trained", "authored", "shipped",
];

const RISKY = [
  "table", "text box", "textbox", "image", "graphic", "logo", "column", "header/footer",
  "watermark", "emoji", "❌", "✔", "✓", "★", "• •", "headshot", "photograph",
];

function lower(value: string): string {
  return (value || "").toLowerCase();
}

export function scoreResume(data: ResumeData, jobDescription = "", sourceText = ""): AtsResult {
  const tips: AtsTip[] = [];
  const allText =
    `${sourceText} ${data.fullName} ${data.headline} ${data.summary} ${data.skills} ` +
    data.experience.map((item) => `${item.role} ${item.company} ${item.bullets}`).join(" ") +
    data.projects.map((item) => `${item.name} ${item.tech} ${item.bullets}`).join(" ") +
    data.education.map((item) => `${item.school} ${item.degree}`).join(" ");
  const text = lower(allText);
  let total = 0;
  let earned = 0;

  total += 20;
  const hasContact = Boolean(data.fullName && data.email && data.phone);
  if (hasContact) earned += 20;
  tips.push({
    status: hasContact ? "pass" : "fail",
    severity: hasContact ? "low" : "high",
    label: "Contact details present",
    detail: hasContact
      ? "Name, email, and phone are available to the parser."
      : "The parser could not confidently identify a full name, email, and phone number.",
    fix: hasContact ? undefined : "Put your name, email, and phone in plain text near the top of the résumé.",
  });

  total += 15;
  const hasSummary = data.summary.trim().length > 40 && data.headline.trim().length > 3;
  if (hasSummary) earned += 15;
  tips.push({
    status: hasSummary ? "pass" : "warning",
    severity: "medium",
    label: "Clear headline and summary",
    detail: hasSummary
      ? "Your headline and short summary are readable by humans and parsers."
      : "A clear role headline and concise professional summary were not both detected.",
    fix: hasSummary ? undefined : "Add a one-line target role followed by a focused 2-3 line summary.",
  });

  total += 20;
  const bullets = data.experience
    .flatMap((item) => item.bullets.split("\n"))
    .concat(data.projects.flatMap((item) => item.bullets.split("\n")))
    .map((bullet) => bullet.trim())
    .filter(Boolean);
  const hasNumbers = bullets.some((bullet) => /\d/.test(bullet));
  const enoughBullets = bullets.length >= 3;
  if (hasNumbers && enoughBullets) earned += 20;
  else if (hasNumbers || enoughBullets) earned += 10;
  tips.push({
    status: hasNumbers && enoughBullets ? "pass" : "warning",
    severity: "medium",
    label: "Measurable, specific bullets",
    detail: hasNumbers && enoughBullets
      ? "Several achievement bullets include measurable evidence."
      : "The résumé needs more achievement bullets or measurable outcomes.",
    fix: hasNumbers && enoughBullets ? undefined : "Add at least 3 bullets and quantify impact with percentages, time, users, scale, or money.",
  });

  total += 15;
  const startedWithVerb = bullets.filter((bullet) => ACTION_VERBS.some((verb) => bullet.toLowerCase().startsWith(verb)));
  const verbRatio = bullets.length ? startedWithVerb.length / bullets.length : 0;
  if (verbRatio >= 0.5) earned += 15;
  else if (verbRatio > 0) earned += 8;
  tips.push({
    status: verbRatio >= 0.5 ? "pass" : "warning",
    severity: "medium",
    label: "Strong action verbs",
    detail: verbRatio >= 0.5
      ? "Most achievement bullets start with direct action verbs."
      : "Too few achievement bullets start with strong action verbs.",
    fix: verbRatio >= 0.5 ? undefined : "Start bullets with verbs such as Built, Led, Improved, Automated, or Delivered.",
  });

  total += 15;
  const skillCount = data.skills.split(",").map((skill) => skill.trim()).filter(Boolean).length;
  if (skillCount >= 5) earned += 15;
  else if (skillCount >= 1) earned += 7;
  tips.push({
    status: skillCount >= 5 ? "pass" : "warning",
    severity: "medium",
    label: "Skills listed",
    detail: skillCount >= 5 ? `${skillCount} skills were detected.` : `Only ${skillCount} clearly separated skill${skillCount === 1 ? " was" : "s were"} detected.`,
    fix: skillCount >= 5 ? undefined : "Add a plain-text Skills section with at least 5 truthful, role-relevant skills.",
  });

  total += 15;
  const hasRiskyLanguage = RISKY.some((term) => text.includes(term));
  if (!hasRiskyLanguage) earned += 15;
  tips.push({
    status: hasRiskyLanguage ? "warning" : "pass",
    severity: "low",
    label: "Content is parser-friendly",
    detail: hasRiskyLanguage
      ? "The text mentions formatting elements that are commonly risky for ATS parsing."
      : "No obvious risky-formatting language was found in the content.",
    fix: hasRiskyLanguage ? "Prefer a single-column layout with plain headings and selectable text." : undefined,
  });

  let score = Math.round((earned / total) * 100);
  let keywordScore = 0;
  let keywordMatches: { term: string; found: boolean }[] = [];
  if (jobDescription.trim()) {
    const jd = lower(jobDescription);
    const stop = new Set([
      "with", "that", "this", "have", "will", "your", "from", "they", "their", "should",
      "which", "about", "would", "could", "must", "able", "work", "role", "team", "are",
      "for", "and", "the", "you", "our", "who", "via", "per", "year", "plus", "into",
    ]);
    const tokens = Array.from(new Set(jd.match(/[a-z][a-z+#.-]{3,}/g) || []))
      .filter((token) => !stop.has(token))
      .slice(0, 25);
    keywordMatches = tokens.map((term) => ({ term, found: text.includes(term) }));
    const hits = keywordMatches.filter((keyword) => keyword.found).length;
    keywordScore = tokens.length ? Math.round((hits / tokens.length) * 100) : 0;
    score = Math.round(score * 0.7 + keywordScore * 0.3);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    tips,
    keywordMatches,
    keywordScore,
  };
}

const STRUCTURAL_WEIGHTS: Record<StructuralCheck["id"], number> = {
  "multi-column": 18,
  "layout-tables": 14,
  "text-layer": 28,
  "header-footer": 12,
  "fonts-characters": 10,
  "text-boxes": 12,
  filename: 6,
};

export function scoreStructuralChecks(checks: StructuralCheck[]): StructuralResult {
  let earned = 0;
  for (const check of checks) {
    const weight = STRUCTURAL_WEIGHTS[check.id];
    if (check.status === "pass") earned += weight;
    else if (check.status === "warning") earned += weight * 0.5;
  }
  const severeBlocker = checks.some((check) => check.id === "text-layer" && check.status === "fail");
  return { score: Math.round(earned), checks, severeBlocker };
}

export function combineAtsScores(contentScore: number, structural: StructuralResult): number {
  const combined = Math.round(contentScore * 0.6 + structural.score * 0.4);
  return structural.severeBlocker ? Math.min(20, combined) : combined;
}

