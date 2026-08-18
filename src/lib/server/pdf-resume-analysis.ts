import "server-only";

import { countResumeWords, normalizeResumeText } from "../resume-text";
import { filenameCheck, hasKeyInformationOnlyAtEdge, structuralCheck, unusualCharacterCheck } from "../structural-helpers";
import type { StructuralCheck } from "../ats-types";
import { MAX_RESUME_PAGES } from "../upload-validation";

interface PositionedItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
  page: number;
}

interface VisualLine {
  y: number;
  items: PositionedItem[];
  segments: string[];
  text: string;
}

interface PdfPageModel {
  number: number;
  width: number;
  height: number;
  items: PositionedItem[];
  lines: VisualLine[];
  imageCount: number;
}

export interface PdfResumeExtraction {
  text: string;
  pageCount: number;
  wordCount: number;
  checks: StructuralCheck[];
  metadata: {
    headings: number;
    bullets: number;
    tables: number;
    textBoxes: number;
    columns: number;
    fonts: string[];
  };
}

function visualLines(items: PositionedItem[], pageWidth: number): VisualLine[] {
  const sorted = [...items].sort((a, b) => (Math.abs(b.y - a.y) > 2.5 ? b.y - a.y : a.x - b.x));
  const groups: PositionedItem[][] = [];
  for (const item of sorted) {
    const line = groups.find((candidate) => Math.abs(candidate[0].y - item.y) <= Math.max(2.5, item.height * 0.35));
    if (line) line.push(item);
    else groups.push([item]);
  }
  return groups
    .sort((a, b) => b[0].y - a[0].y)
    .map((group) => {
      const ordered = group.sort((a, b) => a.x - b.x);
      const segments: string[] = [];
      let segment = "";
      for (let index = 0; index < ordered.length; index += 1) {
        const item = ordered[index];
        const previous = ordered[index - 1];
        const gap = previous ? item.x - (previous.x + previous.width) : 0;
        if (previous && gap > pageWidth * 0.11) {
          if (segment.trim()) segments.push(segment.trim());
          segment = item.text;
        } else {
          const needsSpace = previous && (
            gap > Math.max(1.5, item.height * 0.12)
            || (!/\s$/.test(previous.text) && !/^[,.;:!?)]/.test(item.text))
          );
          segment += `${needsSpace && segment ? " " : ""}${item.text}`;
        }
      }
      if (segment.trim()) segments.push(segment.trim());
      return {
        y: ordered[0]?.y ?? 0,
        items: ordered,
        segments,
        text: segments.join("    "),
      };
    })
    .filter((line) => line.text.trim());
}

function multiColumnEvidence(page: PdfPageModel): { rows: number; spread: number } {
  const splitRows = page.lines.filter((line) => {
    if (line.segments.length >= 2) return true;
    const substantialItems = line.items.filter((item) => item.text.trim().split(/\s+/).length >= 3);
    if (substantialItems.length < 2) return false;
    const left = substantialItems.find((item) => item.x < page.width * 0.45);
    const right = substantialItems.find((item) => item.x > page.width * 0.55);
    return Boolean(left && right && right.x - left.x > page.width * 0.3);
  });
  if (!splitRows.length) return { rows: 0, spread: 0 };
  const ys = splitRows.map((line) => line.y);
  return { rows: splitRows.length, spread: (Math.max(...ys) - Math.min(...ys)) / page.height };
}

function overlappingItems(items: PositionedItem[]): number {
  let overlaps = 0;
  const ordered = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  for (let index = 1; index < ordered.length; index += 1) {
    const a = ordered[index - 1];
    const b = ordered[index];
    const xOverlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const yOverlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    if (xOverlap > 2 && yOverlap > 2) overlaps += 1;
  }
  return overlaps;
}

function headingCount(text: string): number {
  return text.split("\n").filter((line) => /^(summary|profile|skills?|experience|projects?|education|certifications?|achievements?)\s*:?[\s-]*$/i.test(line.trim())).length;
}

function bulletCount(text: string): number {
  return text.split("\n").filter((line) => /^\s*(?:[-*•●◦▪■▸►‣⁃]|\d+[.)])\s+/.test(line)).length;
}

export async function analyzePdfResume(bytes: Uint8Array, filename: string): Promise<PdfResumeExtraction> {
  try {
    const pdfWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    (globalThis as typeof globalThis & { pdfjsWorker?: unknown }).pdfjsWorker ??= pdfWorker;
    const loadingTask = pdfjs.getDocument({
      data: bytes,
      useSystemFonts: true,
      verbosity: 0,
    });
    const document = await loadingTask.promise;
    const pageCount = document.numPages;
    if (pageCount > MAX_RESUME_PAGES) {
      throw new Error(`The PDF has ${pageCount} pages. Résumés are limited to ${MAX_RESUME_PAGES} pages for analysis.`);
    }

    const pages: PdfPageModel[] = [];
    const fontSet = new Set<string>();
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent({ disableNormalization: false, includeMarkedContent: true });
      const items: PositionedItem[] = [];
      for (const raw of content.items) {
        if (!("str" in raw) || !raw.str.trim()) continue;
        const transform = raw.transform as number[];
        items.push({
          text: raw.str,
          x: transform[4] ?? 0,
          y: transform[5] ?? 0,
          width: Math.abs(raw.width || 0),
          height: Math.abs(raw.height || transform[3] || 10),
          font: raw.fontName || "Unknown",
          page: pageNumber,
        });
        fontSet.add(raw.fontName || "Unknown");
      }
      for (const style of Object.values(content.styles)) {
        if (style.fontFamily) fontSet.add(style.fontFamily);
      }

      let imageCount = 0;
      try {
        const operators = await page.getOperatorList();
        const imageOps = new Set([
          pdfjs.OPS.paintImageXObject,
          pdfjs.OPS.paintInlineImageXObject,
          pdfjs.OPS.paintImageMaskXObject,
        ]);
        imageCount = operators.fnArray.filter((operator) => imageOps.has(operator)).length;
      } catch {
        imageCount = 0;
      }

      pages.push({
        number: pageNumber,
        width: viewport.width,
        height: viewport.height,
        items,
        lines: visualLines(items, viewport.width),
        imageCount,
      });
      page.cleanup();
    }
    await loadingTask.destroy();

    const text = normalizeResumeText(pages.map((page) => page.lines.map((line) => line.text).join("\n")).join("\n\n"));
    const wordCount = countResumeWords(text);
    const totalImages = pages.reduce((sum, page) => sum + page.imageCount, 0);
    const multiEvidence = pages.map(multiColumnEvidence);
    const splitRows = multiEvidence.reduce((sum, evidence) => sum + evidence.rows, 0);
    const columnPages = multiEvidence.filter((evidence) => evidence.rows >= 3 && evidence.spread >= 0.22).length;
    const gridRows = pages.reduce((sum, page) => sum + page.lines.filter((line) => line.segments.length >= 3).length, 0);
    const overlaps = pages.reduce((sum, page) => sum + overlappingItems(page.items), 0);

    const outerText = pages.flatMap((page) => page.items.filter((item) => item.y > page.height * 0.975 || item.y < page.height * 0.025)).map((item) => item.text).join(" ");
    const bodyText = pages.flatMap((page) => page.items.filter((item) => item.y <= page.height * 0.975 && item.y >= page.height * 0.025)).map((item) => item.text).join(" ");
    const keyInfoAtEdge = hasKeyInformationOnlyAtEdge(outerText, bodyText);
    const nearZeroText = text.replace(/\s/g, "").length < Math.max(40, pageCount * 30);
    const shortText = !nearZeroText && wordCount < 100;
    const checks: StructuralCheck[] = [];

    checks.push(structuralCheck(
      "text-layer",
      nearZeroText ? "fail" : shortText ? "warning" : "pass",
      "Selectable text layer",
      nearZeroText
        ? `Only ${wordCount} words were extractable across ${pageCount} page${pageCount === 1 ? "" : "s"}${totalImages ? ` while ${totalImages} image object${totalImages === 1 ? " was" : "s were"} detected` : ""}.`
        : shortText
          ? `Only ${wordCount} words were extracted, so the result may be incomplete.`
          : `${wordCount} words were extracted from a selectable text layer.`,
      nearZeroText
        ? "Export the résumé from Word/Docs as a text-based PDF, or use OCR before uploading."
        : shortText
          ? "Check the extracted text below. If content is missing, upload a text-based PDF/DOCX or paste the text."
          : undefined,
      nearZeroText ? "critical" : shortText ? "high" : "low",
    ));
    checks.push(structuralCheck(
      "multi-column",
      columnPages > 0 && splitRows >= 6 ? "fail" : splitRows >= 3 ? "warning" : "pass",
      "Column reading order",
      splitRows >= 3
        ? `${splitRows} lines contain widely separated text regions${columnPages ? ` across ${columnPages} page${columnPages === 1 ? "" : "s"}` : ""}. Reading order may be scrambled.`
        : "No sustained multi-column pattern was detected.",
      splitRows >= 3 ? "Use a single-column résumé and keep dates aligned without a separate sidebar." : undefined,
      splitRows >= 6 ? "high" : "medium",
    ));
    checks.push(structuralCheck(
      "layout-tables",
      gridRows >= 6 ? "fail" : gridRows >= 3 ? "warning" : "pass",
      "Tables used for layout",
      gridRows >= 3 ? `${gridRows} rows show repeated grid-like text alignment.` : "No strong grid-like table pattern was detected.",
      gridRows >= 3 ? "Replace layout tables with normal paragraphs, headings, and bullet lists." : undefined,
      gridRows >= 6 ? "high" : "medium",
    ));
    checks.push(structuralCheck(
      "header-footer",
      keyInfoAtEdge ? "fail" : "pass",
      "Key information in headers or footers",
      keyInfoAtEdge ? "Contact or section information appears only at the extreme page edge." : "No key information was found only in extreme header/footer regions.",
      keyInfoAtEdge ? "Move contact details and section content into the main document body." : undefined,
      keyInfoAtEdge ? "high" : "low",
    ));
    checks.push(unusualCharacterCheck(text, [...fontSet].filter(Boolean)));
    checks.push(structuralCheck(
      "text-boxes",
      overlaps > 8 ? "warning" : "pass",
      "Floating or overlapping text",
      overlaps > 8 ? `${overlaps} overlapping text placements suggest floating elements or layered text.` : "No strong floating-text or overlap signal was detected.",
      overlaps > 8 ? "Move text out of floating boxes and into normal document paragraphs." : undefined,
      overlaps > 8 ? "medium" : "low",
    ));
    checks.push(filenameCheck(filename));

    return {
      text,
      pageCount,
      wordCount,
      checks,
      metadata: {
        headings: headingCount(text),
        bullets: bulletCount(text),
        tables: gridRows >= 3 ? 1 : 0,
        textBoxes: overlaps > 8 ? 1 : 0,
        columns: columnPages > 0 ? 2 : 1,
        fonts: [...fontSet].filter(Boolean).slice(0, 12),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/password|PasswordException/i.test(message) || (error as { name?: string }).name === "PasswordException") {
      throw new Error("This PDF is password-protected. Remove the password or use the paste-text option.");
    }
    if (/Invalid PDF|Missing PDF|bad XRef|format/i.test(message)) {
      throw new Error("This PDF is corrupted or unreadable. Export it again or use the paste-text option.");
    }
    throw error;
  }
}
