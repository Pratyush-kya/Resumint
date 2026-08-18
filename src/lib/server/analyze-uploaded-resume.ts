import "server-only";

import type { UploadAnalysisResponse } from "../ats-types";
import { combineAtsScores, scoreResume, scoreStructuralChecks } from "../ats-engine";
import { languageCalibrationNote, resumeTextToData } from "../resume-text";
import type { ResumeFileKind } from "../upload-validation";
import { analyzeDocxResume } from "./docx-resume-analysis";
import { analyzePdfResume } from "./pdf-resume-analysis";

export async function analyzeUploadedResume(
  bytes: Uint8Array,
  filename: string,
  kind: ResumeFileKind,
  jobDescription: string,
): Promise<UploadAnalysisResponse> {
  const fileSize = bytes.byteLength;
  const extraction = kind === "pdf"
    ? await analyzePdfResume(bytes, filename)
    : await analyzeDocxResume(bytes, filename);
  const resumeData = resumeTextToData(extraction.text);
  const content = scoreResume(resumeData, jobDescription, extraction.text);
  const structural = scoreStructuralChecks(extraction.checks);

  return {
    file: {
      name: filename,
      type: kind,
      size: fileSize,
      pageCount: "pageCount" in extraction && typeof extraction.pageCount === "number" ? extraction.pageCount : undefined,
      wordCount: extraction.wordCount,
    },
    normalizedText: extraction.text,
    resumeData,
    content,
    structural,
    score: combineAtsScores(content.score, structural),
    languageNote: languageCalibrationNote(extraction.text),
    metadata: extraction.metadata,
  };
}
