export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_RESUME_PAGES = 20;
export type ResumeFileKind = "pdf" | "docx";

export interface FileValidationResult {
  ok: boolean;
  kind?: ResumeFileKind;
  error?: string;
}

function extension(name: string): string {
  return name.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
}

export function sniffResumeFile(bytes: Uint8Array, name: string, size = bytes.byteLength): FileValidationResult {
  if (size > MAX_RESUME_BYTES) {
    return { ok: false, error: "This file is larger than 5MB. Please upload a smaller PDF or DOCX." };
  }
  const ext = extension(name);
  if (ext === ".doc") {
    return { ok: false, error: "Legacy .doc files are not supported. Save the file as .docx or PDF and try again." };
  }
  if (ext !== ".pdf" && ext !== ".docx") {
    return { ok: false, error: "Only PDF and DOCX résumé files are supported." };
  }

  const isPdf = bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  const isZip = bytes.length >= 4
    && bytes[0] === 0x50
    && bytes[1] === 0x4b
    && ((bytes[2] === 0x03 && bytes[3] === 0x04)
      || (bytes[2] === 0x05 && bytes[3] === 0x06)
      || (bytes[2] === 0x07 && bytes[3] === 0x08));

  if (ext === ".pdf" && !isPdf) {
    return { ok: false, error: "The file has a .pdf name but its contents are not a valid PDF." };
  }
  if (ext === ".docx" && !isZip) {
    return { ok: false, error: "The file has a .docx name but its contents are not a valid Word document." };
  }
  return { ok: true, kind: ext === ".pdf" ? "pdf" : "docx" };
}
