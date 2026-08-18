import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { analyzePdfResume } from "@/lib/server/pdf-resume-analysis";

async function makeTextPdf(twoColumns: boolean): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("Jane Doe", { x: 54, y: 750, size: 18, font });
  page.drawText("jane@example.com  +91 99999 88888", { x: 54, y: 728, size: 10, font });
  for (let index = 0; index < 16; index += 1) {
    const y = 690 - index * 28;
    page.drawText(`Developed reliable application ${index + 1} with testing and measurable impact for users.`, { x: 54, y, size: 9, font });
    if (twoColumns) page.drawText(`Project ${index + 1} delivered with React and TypeScript.`, { x: 350, y, size: 9, font });
  }
  return pdf.save();
}

describe("PDF structural analysis", () => {
  it("extracts positioned selectable text", async () => {
    const result = await analyzePdfResume(await makeTextPdf(false), "Jane_Doe_Resume.pdf");
    expect(result.wordCount).toBeGreaterThan(100);
    expect(result.text).toContain("Jane Doe");
    expect(result.checks.find((check) => check.id === "text-layer")?.status).toBe("pass");
  });

  it("warns or fails for sustained separated columns", async () => {
    const result = await analyzePdfResume(await makeTextPdf(true), "Jane_Doe_Resume.pdf");
    expect(["warning", "fail"]).toContain(result.checks.find((check) => check.id === "multi-column")?.status);
  });

  it("hard-fails an image-only or blank PDF", async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage([612, 792]);
    const result = await analyzePdfResume(await pdf.save(), "Jane_Doe_Resume.pdf");
    expect(result.checks.find((check) => check.id === "text-layer")?.status).toBe("fail");
  });
});

