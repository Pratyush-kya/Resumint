import { NextResponse } from "next/server";
import { analyzeUploadedResume } from "@/lib/server/analyze-uploaded-resume";
import { MAX_RESUME_BYTES, sniffResumeFile } from "@/lib/upload-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const PROCESSING_TIMEOUT_MS = 25_000;

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function withProcessingTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("The file took too long to parse. Try exporting a simpler copy or use paste text.")),
      PROCESSING_TIMEOUT_MS,
    );
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const upload = formData.get("resume");
    const jobDescription = String(formData.get("jobDescription") || "").slice(0, 50_000);
    if (!(upload instanceof File)) return errorResponse("Choose a PDF or DOCX résumé to analyze.", 400);
    if (upload.size > MAX_RESUME_BYTES) return errorResponse("This file is larger than 5MB.", 413);
    if (!upload.size) return errorResponse("The uploaded file is empty.", 400);

    const bytes = new Uint8Array(await upload.arrayBuffer());
    const validation = sniffResumeFile(bytes.slice(0, 8), upload.name, upload.size);
    if (!validation.ok || !validation.kind) return errorResponse(validation.error || "Unsupported résumé file.", 415);

    const cleanName = upload.name.replace(/[^\p{L}\p{N} ._()-]/gu, "_").slice(0, 180);
    const analysis = await withProcessingTimeout(
      analyzeUploadedResume(bytes, cleanName, validation.kind, jobDescription),
    );
    return NextResponse.json(analysis, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The résumé could not be read.";
    const safeMessage = /password|corrupt|unreadable|not a valid|too many|too long|larger|pages|XML part|OCR|paste/i.test(message)
      ? message
      : "The résumé could not be read. Export a fresh PDF/DOCX or use the paste-text option.";
    return errorResponse(safeMessage, 422);
  }
}
