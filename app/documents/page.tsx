"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/document/file-dropzone";
import { ReviewPanel } from "@/components/document/review-panel";
import { DocumentRecordData, parseAdmissionDocument, makeExtracted } from "@/lib/document/ocr-engine";
import { processRealImageOCR } from "@/lib/document/real-ocr";
import { FileText, CheckCircle, AlertCircle, Clock, Sparkles, Filter, Plus } from "lucide-react";

// Initial Mock Queue
const INITIAL_QUEUE: DocumentRecordData[] = [
  {
    id: "doc-101",
    fileName: "Admission_Form_Aarav_Sharma.pdf",
    documentType: "Admission Application",
    status: "NEEDS_REVIEW",
    confidenceScore: 78.5,
    rawText: `GURUKUL HIGH SCHOOL ADMISSION FORM\nStudent Name: Aarav Sharma\nDate of Birth: 05/11/2008\nApplying Grade: Grade 11B\nParent/Guardian: Priya Sharma\nPhone: +1 555-345-6789\nMedical Notes: Mild Asthma - Needs Inhaler\nPrevious Institution: Valley Heights High`,
    extractedFields: makeExtracted({
      studentName: { value: "Aarav Sharma", confidence: 96 },
      dob: { value: "2008-11-05", confidence: 92 },
      grade: { value: "Grade 11B", confidence: 89 },
      parentName: { value: "Priya Sharma", confidence: 85 },
      contact: { value: "+1 (555) 345-6789", confidence: 91 },
      address: { value: "45 Lotus Parkway, Techville", confidence: 64 },
      medicalNotes: { value: "Mild Asthma - Needs Inhaler", confidence: 58 },
      previousSchool: { value: "Valley Heights High", confidence: 88 },
    }),
    createdAt: "2026-08-13 10:30 AM",
  },
  {
    id: "doc-102",
    fileName: "Transfer_Cert_Sophia_Chen.pdf",
    documentType: "Transfer Certificate",
    status: "APPROVED",
    confidenceScore: 94.2,
    rawText: `TRANSFER CERTIFICATE\nStudent: Sophia Chen\nDOB: 28/09/2009\nGrade: Grade 10A\nStatus: Clear Conduct`,
    extractedFields: makeExtracted({
      studentName: { value: "Sophia Chen", confidence: 98 },
      dob: { value: "2009-09-28", confidence: 95 },
      grade: { value: "Grade 10A", confidence: 96 },
      parentName: { value: "David Chen", confidence: 94 },
      contact: { value: "+1 (555) 876-5432", confidence: 97 },
      address: { value: "128 Oakridge Lane, Metro City", confidence: 91 },
      medicalNotes: { value: "No known allergies", confidence: 89 },
      previousSchool: { value: "Metro Central Middle School", confidence: 94 },
    }),
    createdAt: "2026-08-13 09:15 AM",
  },
];

export default function DocumentIntelligencePage() {
  const [queue, setQueue] = useState<DocumentRecordData[]>(INITIAL_QUEUE);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgressStatus, setOcrProgressStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "NEEDS_REVIEW" | "APPROVED">("ALL");

  const handleFileSelect = async (fileOrName: File | string) => {
    setIsProcessing(true);
    let newDoc: DocumentRecordData;

    if (typeof fileOrName === "string") {
      // Demo test document
      setOcrProgressStatus("Parsing sample document...");
      const parsed = await parseAdmissionDocument(fileOrName);
      newDoc = {
        id: `doc-${Date.now()}`,
        fileName: fileOrName,
        documentType: "Admission Application",
        status: parsed.overallConfidence < 85 ? "NEEDS_REVIEW" : "APPROVED",
        confidenceScore: parsed.overallConfidence,
        rawText: parsed.rawText,
        extractedFields: parsed.extracted,
        createdAt: "Just now",
      };
    } else {
      // Real File dropped/uploaded by user
      const realResult = await processRealImageOCR(fileOrName, (status) => {
        setOcrProgressStatus(status);
      });

      const hasEmptyFields = Object.values(realResult.extracted).some(
        (f) => !f.value || f.value.trim().length === 0
      );

      newDoc = {
        id: `doc-${Date.now()}`,
        fileName: fileOrName.name,
        documentType: "Scanned Document (OCR)",
        status: hasEmptyFields || realResult.overallConfidence < 85 ? "NEEDS_REVIEW" : "APPROVED",
        confidenceScore: realResult.overallConfidence,
        rawText: realResult.rawText,
        extractedFields: realResult.extracted,
        fileUrl: realResult.imagePreviewUrl,
        createdAt: "Just now",
      };
    }

    setQueue((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setIsProcessing(false);
    setOcrProgressStatus("");
  };

  const handleApproveRecord = (updatedValues: Record<string, string>) => {
    if (!activeDocId) return;

    setQueue((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDocId) {
          // Type-safe generic update: copy keeps the ExtractedDocument type,
          // keyed assignment updates every field without any casting.
          const updatedFields = { ...doc.extractedFields };
          (Object.keys(updatedFields) as (keyof typeof updatedFields)[]).forEach((key) => {
            updatedFields[key] = {
              value: updatedValues[key] !== undefined ? updatedValues[key] : updatedFields[key].value,
              confidence: 100,
            };
          });

          return {
            ...doc,
            status: "APPROVED" as const,
            confidenceScore: 100,
            extractedFields: updatedFields,
          };
        }
        return doc;
      })
    );

    setActiveDocId(null);
  };

  const activeDoc = queue.find((d) => d.id === activeDocId);

  const filteredQueue = queue.filter((d) => {
    if (filterStatus === "NEEDS_REVIEW") return d.status === "NEEDS_REVIEW";
    if (filterStatus === "APPROVED") return d.status === "APPROVED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gurukul-gray pb-5">
        <div>
          <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">Document Intelligence Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated document ingestion, real Tesseract image OCR parsing, exact field matching (unmatched fields left blank), and human verification.
          </p>
        </div>
      </div>

      {activeDoc ? (
        <ReviewPanel
          document={activeDoc}
          onApprove={handleApproveRecord}
          onBack={() => setActiveDocId(null)}
        />
      ) : (
        <>
          {/* File Upload Dropzone */}
          <FileDropzone
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            ocrProgressStatus={ocrProgressStatus}
          />

          {/* Processing Queue & Records Table */}
          <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-gurukul-gray bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gurukul-dark">Document Processing Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any document needing review to open the side-by-side verification view.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gurukul-gray text-xs font-medium">
                <button
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStatus === "ALL" ? "bg-gurukul-tech text-white" : "text-slate-600 hover:text-gurukul-dark"
                  }`}
                >
                  All ({queue.length})
                </button>
                <button
                  onClick={() => setFilterStatus("NEEDS_REVIEW")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStatus === "NEEDS_REVIEW"
                      ? "bg-gurukul-tech text-white"
                      : "text-slate-600 hover:text-gurukul-dark"
                  }`}
                >
                  Needs Review ({queue.filter((q) => q.status === "NEEDS_REVIEW").length})
                </button>
                <button
                  onClick={() => setFilterStatus("APPROVED")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStatus === "APPROVED" ? "bg-gurukul-tech text-white" : "text-slate-600 hover:text-gurukul-dark"
                  }`}
                >
                  Approved ({queue.filter((q) => q.status === "APPROVED").length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-gurukul-gray text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Document Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">OCR Score</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Extracted Student</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gurukul-gray">
                  {filteredQueue.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setActiveDocId(doc.id)}
                    >
                      <td className="px-6 py-4 font-medium text-gurukul-dark flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gurukul-dark group-hover:text-gurukul-tech transition-colors">
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">{doc.createdAt}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{doc.documentType}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                doc.confidenceScore >= 85 ? "bg-gurukul-tech" : "bg-amber-500"
                              }`}
                              style={{ width: `${doc.confidenceScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-700 font-medium">
                            {doc.confidenceScore.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 uppercase tracking-wider ${
                            doc.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gurukul-gray text-slate-700 font-bold"
                          }`}
                        >
                          {doc.status === "APPROVED" ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Approved
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Needs Review
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {doc.extractedFields.studentName.value ? (
                          `${doc.extractedFields.studentName.value} (${doc.extractedFields.grade.value || "Grade N/A"})`
                        ) : (
                          <span className="text-amber-600 font-normal italic">[Student Name Unmatched]</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDocId(doc.id);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                            doc.status === "APPROVED"
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-gurukul-tech text-white hover:bg-gurukul-tech/90 shadow-xs"
                          }`}
                        >
                          {doc.status === "APPROVED" ? "View Verification" : "Review Fields"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
