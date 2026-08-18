import "server-only";

import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { StructuralCheck } from "../ats-types";
import { countResumeWords, normalizeResumeText } from "../resume-text";
import { filenameCheck, hasKeyInformationOnlyAtEdge, structuralCheck, unusualCharacterCheck } from "../structural-helpers";

interface OrderedNode {
  [key: string]: unknown;
}

export interface DocxResumeExtraction {
  text: string;
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

const orderedParser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: false,
  parseTagValue: false,
  processEntities: false,
});

function emitOrderedText(value: unknown, output: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) emitOrderedText(item, output);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value as OrderedNode)) {
    if (key === ":@") continue;
    if (key === "#text") {
      output.push(String(child));
    } else if (key === "tab") {
      output.push("\t");
    } else if (key === "br" || key === "cr") {
      output.push("\n");
    } else if (key === "p") {
      emitOrderedText(child, output);
      output.push("\n");
    } else if (key === "tc") {
      emitOrderedText(child, output);
      output.push("\t");
    } else if (key === "tr") {
      emitOrderedText(child, output);
      output.push("\n");
    } else {
      emitOrderedText(child, output);
    }
  }
}

function extractXmlText(xml: string): string {
  const output: string[] = [];
  emitOrderedText(orderedParser.parse(xml), output);
  return normalizeResumeText(output.join(""));
}

function countMatches(xml: string, pattern: RegExp): number {
  return xml.match(pattern)?.length ?? 0;
}

function uniqueFonts(...xmlDocuments: string[]): string[] {
  const fonts = new Set<string>();
  const pattern = /w:(?:ascii|hAnsi|eastAsia|cs)="([^"]+)"/gi;
  for (const xml of xmlDocuments) {
    for (const match of xml.matchAll(pattern)) fonts.add(match[1]);
  }
  return [...fonts].slice(0, 20);
}

async function readXml(zip: JSZip, path: string, limit: number): Promise<string> {
  const entry = zip.file(path);
  if (!entry) return "";
  const content = await entry.async("string");
  if (content.length > limit) throw new Error("The DOCX contains an unusually large XML part and cannot be processed safely.");
  return content;
}

export async function analyzeDocxResume(bytes: Uint8Array, filename: string): Promise<DocxResumeExtraction> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(bytes, { createFolders: false });
  } catch {
    throw new Error("This DOCX is corrupted or unreadable. Save a fresh copy or use the paste-text option.");
  }
  const entries = Object.keys(zip.files);
  if (entries.length > 1_000) throw new Error("This DOCX contains too many internal files to process safely.");
  if (!zip.file("[Content_Types].xml") || !zip.file("word/document.xml")) {
    throw new Error("This file is a ZIP archive but not a valid DOCX résumé.");
  }

  const documentXml = await readXml(zip, "word/document.xml", 12 * 1024 * 1024);
  const stylesXml = await readXml(zip, "word/styles.xml", 3 * 1024 * 1024);
  const numberingXml = await readXml(zip, "word/numbering.xml", 3 * 1024 * 1024);
  const headerPaths = entries.filter((path) => /^word\/header\d*\.xml$/i.test(path));
  const footerPaths = entries.filter((path) => /^word\/footer\d*\.xml$/i.test(path));
  const headerXmlParts = await Promise.all(headerPaths.map((path) => readXml(zip, path, 2 * 1024 * 1024)));
  const footerXmlParts = await Promise.all(footerPaths.map((path) => readXml(zip, path, 2 * 1024 * 1024)));

  const text = extractXmlText(documentXml);
  const headerText = normalizeResumeText(headerXmlParts.map(extractXmlText).join("\n"));
  const footerText = normalizeResumeText(footerXmlParts.map(extractXmlText).join("\n"));
  const wordCount = countResumeWords(text);
  const tables = countMatches(documentXml, /<w:tbl(?:\s|>)/gi);
  const textBoxes = countMatches(documentXml, /<(?:w:txbxContent|v:textbox|wps:txbx)(?:\s|>)/gi);
  const floatingDrawings = countMatches(documentXml, /<(?:wp:anchor|w:pict)(?:\s|>)/gi);
  const headings = countMatches(documentXml, /<w:pStyle\b[^>]*w:val="(?:Heading|Title)/gi);
  const bullets = countMatches(documentXml, /<w:numPr(?:\s|>)/gi);
  const sectionColumns = [...documentXml.matchAll(/<w:cols\b[^>]*w:num="(\d+)"/gi)].map((match) => Number(match[1]));
  const columns = Math.max(1, ...sectionColumns.filter(Number.isFinite));
  const fonts = uniqueFonts(documentXml, stylesXml);
  const mediaCount = entries.filter((path) => /^word\/media\//i.test(path) && !zip.files[path].dir).length;
  const nearZeroText = text.replace(/\s/g, "").length < 40;
  const shortText = !nearZeroText && wordCount < 100;
  const keyInfoInHeaderFooter = hasKeyInformationOnlyAtEdge(`${headerText}\n${footerText}`, text);
  const checks: StructuralCheck[] = [];

  checks.push(structuralCheck(
    "text-layer",
    nearZeroText ? "fail" : shortText ? "warning" : "pass",
    "Readable document text",
    nearZeroText
      ? `Only ${wordCount} words were extractable${mediaCount ? ` while ${mediaCount} embedded image${mediaCount === 1 ? " was" : "s were"} found` : ""}.`
      : shortText
        ? `Only ${wordCount} words were extracted, so the résumé may be incomplete.`
        : `${wordCount} words were extracted from normal Word paragraphs.`,
    nearZeroText
      ? "Replace screenshots or scanned pages with editable Word text, or paste the résumé text."
      : shortText
        ? "Review the extracted text and make sure the document is complete."
        : undefined,
    nearZeroText ? "critical" : shortText ? "high" : "low",
  ));
  checks.push(structuralCheck(
    "multi-column",
    columns > 1 ? "fail" : "pass",
    "Column reading order",
    columns > 1 ? `The DOCX defines a ${columns}-column section.` : "No multi-column Word sections were found.",
    columns > 1 ? "Change the page layout to one column and remove sidebars." : undefined,
    columns > 1 ? "high" : "low",
  ));
  checks.push(structuralCheck(
    "layout-tables",
    tables > 1 ? "fail" : tables === 1 ? "warning" : "pass",
    "Tables used for layout",
    tables ? `${tables} Word table${tables === 1 ? " was" : "s were"} found in the document body.` : "No Word tables were found in the document body.",
    tables ? "Move résumé content out of tables and into normal paragraphs and bullet lists." : undefined,
    tables > 1 ? "high" : tables === 1 ? "medium" : "low",
  ));
  checks.push(structuralCheck(
    "header-footer",
    keyInfoInHeaderFooter ? "fail" : headerText || footerText ? "warning" : "pass",
    "Key information in headers or footers",
    keyInfoInHeaderFooter
      ? "Contact or section information appears only inside a Word header/footer."
      : headerText || footerText
        ? "Header/footer text exists, but key résumé information was also found in the main body."
        : "No résumé text was found in Word headers or footers.",
    keyInfoInHeaderFooter
      ? "Move contact details and section content into normal body paragraphs."
      : headerText || footerText
        ? "Keep headers and footers decorative only, and retain all important text in the body."
        : undefined,
    keyInfoInHeaderFooter ? "high" : headerText || footerText ? "low" : "low",
  ));
  checks.push(unusualCharacterCheck(text, fonts));
  checks.push(structuralCheck(
    "text-boxes",
    textBoxes > 0 ? "fail" : floatingDrawings > 0 ? "warning" : "pass",
    "Text boxes and floating elements",
    textBoxes > 0
      ? `${textBoxes} text box${textBoxes === 1 ? " was" : "es were"} found in the DOCX XML.`
      : floatingDrawings > 0
        ? `${floatingDrawings} floating drawing element${floatingDrawings === 1 ? " was" : "s were"} found.`
        : "No text boxes or floating drawing anchors were found.",
    textBoxes > 0 || floatingDrawings > 0 ? "Move text into normal paragraphs and use inline images only when necessary." : undefined,
    textBoxes > 0 ? "high" : floatingDrawings > 0 ? "medium" : "low",
  ));
  checks.push(filenameCheck(filename));

  return {
    text,
    wordCount,
    checks,
    metadata: {
      headings,
      bullets: Math.max(bullets, countMatches(numberingXml, /<w:abstractNum(?:\s|>)/gi)),
      tables,
      textBoxes,
      columns,
      fonts,
    },
  };
}
