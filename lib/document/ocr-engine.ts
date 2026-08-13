export interface ExtractedField {
  value: string;
  confidence: number; // 0 - 100
}

export interface ExtractedDocument {
  studentName: ExtractedField;
  dob: ExtractedField;
  grade: ExtractedField;
  parentName: ExtractedField;
  contact: ExtractedField;
  address: ExtractedField;
  medicalNotes: ExtractedField;
  previousSchool: ExtractedField;
}

export interface DocumentRecordData {
  id: string;
  fileName: string;
  documentType: string;
  status: "UPLOADING" | "PROCESSING" | "NEEDS_REVIEW" | "APPROVED" | "REJECTED";
  confidenceScore: number;
  rawText: string;
  extractedFields: ExtractedDocument;
  fileUrl?: string;
  createdAt: string;
}

/**
 * Simulates intelligent document OCR parsing & structured data extraction
 */
export async function parseAdmissionDocument(
  fileName: string,
  fileSize?: number
): Promise<{ overallConfidence: number; extracted: ExtractedDocument; rawText: string }> {
  // Simulate network/OCR latency
  await new Promise((res) => setTimeout(res, 800));

  // Determine standard mock field values based on file name triggers or standard defaults
  const isAarav = fileName.toLowerCase().includes("aarav") || fileName.toLowerCase().includes("sharma");
  const isSophia = fileName.toLowerCase().includes("sophia") || fileName.toLowerCase().includes("chen");

  if (isSophia) {
    const extracted: ExtractedDocument = {
      studentName: { value: "Sophia Chen", confidence: 98 },
      dob: { value: "2009-09-28", confidence: 95 },
      grade: { value: "Grade 10A", confidence: 96 },
      parentName: { value: "David Chen", confidence: 94 },
      contact: { value: "+1 (555) 876-5432", confidence: 97 },
      address: { value: "128 Oakridge Lane, Metro City", confidence: 91 },
      medicalNotes: { value: "No known allergies", confidence: 89 },
      previousSchool: { value: "Metro Central Middle School", confidence: 94 },
    };
    return {
      overallConfidence: 94.2,
      extracted,
      rawText: `GURUKUL ADMISSION APPLICATION\nApplicant: Sophia Chen\nDOB: 28-09-2009\nGrade: Grade 10A\nGuardian: David Chen\nContact: +1 (555) 876-5432`,
    };
  }

  // Default demo admission form (with flagged low-confidence fields for human review)
  const extracted: ExtractedDocument = {
    studentName: { value: isAarav ? "Aarav Sharma" : "Marcus Vance", confidence: 95 },
    dob: { value: "2008-11-05", confidence: 92 },
    grade: { value: "Grade 11B", confidence: 88 },
    parentName: { value: "Priya Sharma", confidence: 86 },
    contact: { value: "+1 (555) 345-6789", confidence: 90 },
    address: { value: "45 Lotus Parkway, Techville", confidence: 62 }, // Needs review (< 85%)
    medicalNotes: { value: "Mild Asthma - Needs Inhaler", confidence: 55 }, // Needs review (< 85%)
    previousSchool: { value: "Valley Heights High", confidence: 87 },
  };

  const overallConfidence = 81.9;

  return {
    overallConfidence,
    extracted,
    rawText: `GURUKUL HIGH SCHOOL ADMISSION FORM\nStudent Name: Aarav Sharma\nDate of Birth: 05/11/2008\nApplying Grade: Grade 11B\nParent/Guardian: Priya Sharma\nPhone: +1 555-345-6789\nMedical Notes: Mild Asthma - Needs Inhaler\nPrevious Institution: Valley Heights High`,
  };
}
