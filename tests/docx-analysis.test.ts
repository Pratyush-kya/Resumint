import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { analyzeDocxResume } from "@/lib/server/docx-resume-analysis";

async function makeDocx(bodyXml: string, extras: Record<string, string> = {}): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", "<?xml version=\"1.0\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"></Types>");
  zip.file("word/document.xml", `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><w:body>${bodyXml}</w:body></w:document>`);
  for (const [path, content] of Object.entries(extras)) zip.file(path, content);
  return zip.generateAsync({ type: "uint8array" });
}

function paragraphs(count = 16): string {
  return Array.from({ length: count }, (_, index) => `<w:p><w:r><w:t>Developed project ${index + 1} with reliable testing, measurable results, collaboration, documentation, and production delivery.</w:t></w:r></w:p>`).join("");
}

describe("DOCX structural analysis", () => {
  it("passes a plain single-column document", async () => {
    const result = await analyzeDocxResume(await makeDocx(paragraphs()), "Jane_Doe_Resume.docx");
    expect(result.wordCount).toBeGreaterThan(100);
    expect(result.checks.find((check) => check.id === "multi-column")?.status).toBe("pass");
    expect(result.checks.find((check) => check.id === "layout-tables")?.status).toBe("pass");
    expect(result.checks.find((check) => check.id === "filename")?.status).toBe("pass");
  });

  it("detects columns, layout tables, text boxes, and key header text", async () => {
    const riskyBody = `${paragraphs()}<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Layout cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p><w:r><w:txbxContent><w:p><w:r><w:t>Floating résumé text</w:t></w:r></w:p></w:txbxContent></w:r></w:p><w:sectPr><w:cols w:num="2"/></w:sectPr>`;
    const header = "<?xml version=\"1.0\"?><w:hdr xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:p><w:r><w:t>header-only@example.com +91 9999999999</w:t></w:r></w:p></w:hdr>";
    const result = await analyzeDocxResume(await makeDocx(riskyBody, { "word/header1.xml": header }), "resume-final.docx");
    expect(result.checks.find((check) => check.id === "multi-column")?.status).toBe("fail");
    expect(result.checks.find((check) => check.id === "layout-tables")?.status).toBe("warning");
    expect(result.checks.find((check) => check.id === "text-boxes")?.status).toBe("fail");
    expect(result.checks.find((check) => check.id === "header-footer")?.status).toBe("fail");
    expect(result.checks.find((check) => check.id === "filename")?.status).toBe("warning");
  });
});

