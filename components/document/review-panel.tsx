"use client";

import React, { useState } from "react";
import { CheckCircle, AlertTriangle, FileText, UserCheck, ShieldCheck, Edit3, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { DocumentRecordData } from "@/lib/document/ocr-engine";

interface ReviewPanelProps {
  document: DocumentRecordData;
  onApprove: (updatedFields: Record<string, string>) => void;
  onBack?: () => void;
}

export function ReviewPanel({ document, onApprove, onBack }: ReviewPanelProps) {
  // Generic: track ALL extracted fields (23-field admission schema)
  const [fields, setFields] = useState<Record<string, { value: string; confidence: number }>>(
    () => ({ ...document.extractedFields })
  );

  const FIELD_LABELS: Record<string, string> = {
    academicYear: "Academic Year",
    applicationDate: "Application Date",
    studentName: "Full Name",
    dob: "Date of Birth",
    gender: "Gender",
    nationality: "Nationality",
    religion: "Religion",
    address: "Residential Address",
    cityStateZip: "City / State / Zip",
    grade: "Grade / Class Applied For",
    previousSchool: "Last School Attended",
    mediumOfInstruction: "Medium of Instruction",
    tcNumber: "Transfer Certificate No.",
    fatherName: "Father's Name",
    fatherOccupation: "Father's Occupation",
    motherName: "Mother's Name",
    motherOccupation: "Mother's Occupation",
    parentName: "Parent / Guardian",
    contact: "Primary Contact Number",
    email: "Email Address",
    emergencyContactPerson: "Emergency Contact Person",
    emergencyPhone: "Emergency Contact Phone",
    medicalNotes: "Medical Notes",
  };

  const handleFieldChange = (key: string, newValue: string) => {
    setFields((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: newValue,
        confidence: 100, // Editing manually marks field as 100% human verified
      },
    }));
  };

  const handleApprove = () => {
    const finalValues: Record<string, string> = {};
    Object.keys(fields).forEach((k) => {
      finalValues[k] = fields[k].value;
    });
    onApprove(finalValues);
  };

  const lowConfidenceCount = Object.values(fields).filter((f) => f.confidence < 85).length;

  return (
    <div className="bg-white rounded-xl border border-gurukul-gray shadow-card overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gurukul-gray bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gurukul-dark">{document.fileName}</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                  lowConfidenceCount > 0
                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {lowConfidenceCount > 0 ? `${lowConfidenceCount} Field(s) Blank / Review` : "High Confidence Ready"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Overall OCR Confidence Score: <span className="font-semibold text-gurukul-dark">{document.confidenceScore.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleApprove}
          className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approve & Create Student Record</span>
        </button>
      </div>

      {/* Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gurukul-gray h-[720px]">
        {/* Left Column: Scanned Image Preview (Bigger Image) */}
        <div className="lg:col-span-6 p-6 bg-slate-100 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gurukul-tech" />
              <span>Original Image / Source Stream</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Tesseract Engine</span>
          </div>

          <div className="flex-1 bg-white rounded-lg border border-slate-300 p-3 flex items-center justify-center shadow-xs overflow-hidden relative">
            {document.fileUrl ? (
              <img
                src={document.fileUrl}
                alt="Original Document Preview"
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-bold text-gurukul-dark">GURUKUL ACADEMY</div>
                <div className="text-xs text-slate-500">Official Student Intake Record</div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <span>Status: Scanned via Tesseract.js</span>
            <span className="text-gurukul-tech font-medium">Original Upload</span>
          </div>
        </div>

        {/* Right Column: Interactive Extracted Fields Form (Only Fields Scrollable) */}
        <div className="lg:col-span-6 p-6 bg-white flex flex-col h-full overflow-hidden justify-between">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 shrink-0">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Extracted Fields (Blank if Not Found in Image)
              </h3>
              <span className="text-xs text-slate-400">Edit any field inline</span>
            </div>

            {/* ONLY this container is scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {Object.entries(fields).map(([key, fieldData]) => {
                const label =
                  FIELD_LABELS[key] ||
                  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                const isHighConfidence = fieldData.confidence >= 85;
                const isBlank = !fieldData.value || fieldData.value.trim().length === 0;

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border transition-all ${
                      isBlank
                        ? "border-amber-300 bg-amber-50/40 shadow-xs"
                        : isHighConfidence
                        ? "border-slate-200 bg-slate-50/50"
                        : "border-slate-300 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <span>{label}</span>
                        {isBlank && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                            Not Found in Image (Blank)
                          </span>
                        )}
                      </label>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                          isBlank
                            ? "bg-amber-100 text-amber-800 font-bold"
                            : isHighConfidence
                            ? "bg-gurukul-tech text-white"
                            : "bg-gurukul-gray text-slate-700 font-bold"
                        }`}
                      >
                        {isBlank
                          ? "0% Unmatched"
                          : isHighConfidence
                          ? `${fieldData.confidence}% High Conf`
                          : `${fieldData.confidence}% Confidence`}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={fieldData.value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        placeholder="[Not detected in image — enter manually]"
                        className={`w-full text-xs py-1.5 px-3 rounded border font-medium transition-colors ${
                          isBlank
                            ? "bg-white border-amber-400 text-gurukul-dark placeholder-slate-400 focus:border-gurukul-tech"
                            : "bg-white border-slate-300 text-gurukul-dark focus:border-gurukul-tech"
                        } focus:outline-none`}
                      />
                      <Edit3 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500">
              Human review verifies all extracted data before saving to student database.
            </p>
            <button
              onClick={handleApprove}
              className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve & Create Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
