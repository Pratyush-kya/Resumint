import type { ResumeData } from "./resume-types";

export type AtsStatus = "pass" | "warning" | "fail";
export type AtsSeverity = "low" | "medium" | "high" | "critical";

export interface AtsTip {
  status: AtsStatus;
  label: string;
  detail: string;
  fix?: string;
  severity?: AtsSeverity;
}

export interface AtsResult {
  score: number;
  tips: AtsTip[];
  keywordMatches: { term: string; found: boolean }[];
  keywordScore: number;
}

export interface StructuralCheck extends AtsTip {
  id:
    | "multi-column"
    | "layout-tables"
    | "text-layer"
    | "header-footer"
    | "fonts-characters"
    | "text-boxes"
    | "filename";
}

export interface StructuralResult {
  score: number;
  checks: StructuralCheck[];
  severeBlocker: boolean;
}

export interface UploadAnalysisResponse {
  file: {
    name: string;
    type: "pdf" | "docx";
    size: number;
    pageCount?: number;
    wordCount: number;
  };
  normalizedText: string;
  resumeData: ResumeData;
  content: AtsResult;
  structural: StructuralResult;
  score: number;
  languageNote?: string;
  metadata: {
    headings: number;
    bullets: number;
    tables: number;
    textBoxes: number;
    columns: number;
    fonts: string[];
  };
}

