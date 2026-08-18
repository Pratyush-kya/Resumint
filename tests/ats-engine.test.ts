import { describe, expect, it } from "vitest";
import { combineAtsScores, scoreStructuralChecks } from "@/lib/ats-engine";
import { normalizeResumeText, resumeTextToData } from "@/lib/resume-text";
import { filenameCheck, structuralCheck } from "@/lib/structural-helpers";
import { sniffResumeFile } from "@/lib/upload-validation";

describe("resume text normalization", () => {
  it("extracts common identity and content fields from pasted text", () => {
    const text = normalizeResumeText("Jane Doe\r\nSoftware Developer\r\njane@example.com | +91 99999 88888\r\nSummary\r\nBuilt reliable web applications for community teams.\r\nSkills: TypeScript, React, Git, SQL, Testing\r\n• Built a dashboard used by 200 people");
    const data = resumeTextToData(text);
    expect(data.fullName).toBe("Jane Doe");
    expect(data.headline).toBe("Software Developer");
    expect(data.email).toBe("jane@example.com");
    expect(data.phone).toContain("99999");
    expect(data.experience[0].bullets).toContain("200 people");
  });
});

describe("unified scoring", () => {
  it("caps a résumé with no text layer at 20", () => {
    const structural = scoreStructuralChecks([
      structuralCheck("text-layer", "fail", "Text layer", "No text", "Use OCR", "critical"),
      structuralCheck("multi-column", "pass", "Columns", "One column"),
      structuralCheck("layout-tables", "pass", "Tables", "No tables"),
      structuralCheck("header-footer", "pass", "Headers", "Safe"),
      structuralCheck("fonts-characters", "pass", "Fonts", "Safe"),
      structuralCheck("text-boxes", "pass", "Boxes", "Safe"),
      filenameCheck("Jane_Doe_Resume.pdf"),
    ]);
    expect(structural.severeBlocker).toBe(true);
    expect(combineAtsScores(100, structural)).toBeLessThanOrEqual(20);
  });
});

describe("file validation", () => {
  it("rejects renamed and legacy files", () => {
    expect(sniffResumeFile(new Uint8Array([1, 2, 3]), "resume.pdf").ok).toBe(false);
    expect(sniffResumeFile(new Uint8Array([0xd0, 0xcf]), "resume.doc").error).toContain("Legacy .doc");
  });

  it("recognizes PDF and DOCX signatures", () => {
    expect(sniffResumeFile(new TextEncoder().encode("%PDF-1.7"), "Jane_Doe_Resume.pdf").kind).toBe("pdf");
    expect(sniffResumeFile(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), "Jane_Doe_Resume.docx").kind).toBe("docx");
  });
});

