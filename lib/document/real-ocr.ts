import { createWorker } from "tesseract.js";
import { ExtractedDocument, ExtractedField } from "./ocr-engine";

export interface RealOCRResult {
  overallConfidence: number;
  extracted: ExtractedDocument;
  rawText: string;
  imagePreviewUrl?: string;
}

/**
 * Performs real OCR parsing on an image file using Tesseract.js.
 * If a field is not found in the original image text, it is set to blank ("") with 0% confidence.
 */
export async function processRealImageOCR(
  fileOrUrl: File | string,
  progressCallback?: (status: string, progress: number) => void
): Promise<RealOCRResult> {
  let imagePreviewUrl: string | undefined;
  let sourceInput: File | string = fileOrUrl;

  if (typeof fileOrUrl !== "string") {
    imagePreviewUrl = URL.createObjectURL(fileOrUrl);
  } else {
    imagePreviewUrl = fileOrUrl;
  }

  let rawText = "";
  let confidenceScores: number[] = [];

  try {
    if (progressCallback) progressCallback("Initializing OCR Engine...", 10);
    const worker = await createWorker("eng");

    if (progressCallback) progressCallback("Scanning Image & Extracting Text...", 40);

    const ret = await worker.recognize(sourceInput);
    rawText = ret.data.text || "";
    
    confidenceScores = [ret.data.confidence || 85];

    await worker.terminate();
  } catch (error) {
    console.error("Tesseract OCR Processing Error:", error);
    // Fallback if worker fails to load (e.g. cross-origin/network error on tesseract CDN)
    rawText = "";
  }

  if (progressCallback) progressCallback("Parsing Structured Fields...", 90);

  // Field Extraction Rules based strictly on rawText
  const studentName = extractField(rawText, /(?:Student\s*Name|Full\s*Name|Applicant|Student):\s*([A-Za-z\s\.\'-]+)/i, confidenceScores);
  const dob = extractField(rawText, /(?:Date\s*of\s*Birth|DOB|Birth\s*Date):\s*([0-9]{1,4}[-/\.][0-9]{1,2}[-/\.][0-9]{1,4})/i, confidenceScores);
  const grade = extractField(rawText, /(?:Applying\s*Grade|Grade|Class):\s*(Grade\s*\d{1,2}[A-Z]?|\d{1,2}[A-Z]?)/i, confidenceScores);
  const parentName = extractField(rawText, /(?:Parent(?:\/Guardian)?|Guardian|Father|Mother):\s*([A-Za-z\s\.\'-]+)/i, confidenceScores);
  const contact = extractField(rawText, /(?:Phone|Contact|Mobile|Tel):\s*([\+\d\s\-\(\)]{7,})/i, confidenceScores);
  const address = extractField(rawText, /(?:Address|Residing\s*at):\s*([^\n\r]+)/i, confidenceScores);
  const medicalNotes = extractField(rawText, /(?:Medical\s*Notes|Medical|Allergies|Health):\s*([^\n\r]+)/i, confidenceScores);
  const previousSchool = extractField(rawText, /(?:Previous\s*Institution|Previous\s*School|School):\s*([^\n\r]+)/i, confidenceScores);

  const extracted: ExtractedDocument = {
    studentName,
    dob,
    grade,
    parentName,
    contact,
    address,
    medicalNotes,
    previousSchool,
  };

  // Calculate overall confidence based on matched fields
  const matchedFields = Object.values(extracted).filter((f) => f.value.trim().length > 0);
  let overallConfidence = 0;
  if (matchedFields.length > 0) {
    const sum = matchedFields.reduce((acc, curr) => acc + curr.confidence, 0);
    overallConfidence = Math.round((sum / matchedFields.length) * 10) / 10;
  }

  if (progressCallback) progressCallback("Complete", 100);

  return {
    overallConfidence,
    extracted,
    rawText,
    imagePreviewUrl,
  };
}

function extractField(text: string, regex: RegExp, confidencePool: number[]): ExtractedField {
  if (!text) return { value: "", confidence: 0 };
  const match = text.match(regex);
  if (match && match[1] && match[1].trim().length > 0) {
    const cleanedValue = match[1].trim();
    const avgConfidence =
      confidencePool.length > 0
        ? Math.round(confidencePool.reduce((a, b) => a + b, 0) / confidencePool.length)
        : 88;
    return {
      value: cleanedValue,
      confidence: Math.min(100, Math.max(50, avgConfidence)),
    };
  }
  // IF NOT MATCHED, RETURN BLANK FIELD ("") WITH 0 CONFIDENCE
  return {
    value: "",
    confidence: 0,
  };
}
