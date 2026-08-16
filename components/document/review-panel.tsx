"use client";

import React, { useState } from "react";
import { CheckCircle, ArrowLeft, Image as ImageIcon, Edit3, FileText } from "lucide-react";
import { DocumentRecordData } from "@/lib/document/ocr-engine";

interface ReviewPanelProps {
  document: DocumentRecordData;
  onApprove: (updatedFields: Record<string, string>) => void;
  onBack?: () => void;
}

export function ReviewPanel({ document, onApprove, onBack }: ReviewPanelProps) {
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
        confidence: 100,
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
    <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-md text-neutral-400 hover:text-gurukul-dark hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gurukul-dark">{document.fileName}</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${
                  lowConfidenceCount > 0
                    ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {lowConfidenceCount > 0 ? `${lowConfidenceCount} field(s) need review` : "High confidence"}
              </span>
            </div>
            <p className="text-[11px] text-gurukul-ocean mt-0.5">
              Confidence: <span className="font-medium text-gurukul-dark">{document.confidenceScore.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleApprove}
          className="bg-gurukul-dark hover:bg-neutral-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Approve & Create Record</span>
        </button>
      </div>

      {/* Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 h-[720px]">
        {/* Left Column: Scanned Image Preview */}
        <div className="lg:col-span-6 p-5 bg-neutral-50 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-2.5 shrink-0">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3" />
              <span>Scanned Document</span>
            </span>
          </div>

          <div className="flex-1 bg-white rounded-lg border border-neutral-200 p-2.5 flex items-center justify-center overflow-hidden relative">
            {document.fileUrl ? (
              <img
                src={document.fileUrl}
                alt="Original Document Preview"
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-12 h-12 text-neutral-200 mx-auto mb-2" />
                <div className="text-xs font-semibold text-gurukul-dark">GURUKUL ACADEMY</div>
                <div className="text-[11px] text-neutral-400">Official Student Intake Record</div>
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-400 shrink-0">
            <span>Uploaded scan</span>
            <span className="text-neutral-500 font-medium">Original Upload</span>
          </div>
        </div>

        {/* Right Column: Interactive Extracted Fields Form */}
        <div className="lg:col-span-6 p-5 bg-white flex flex-col h-full overflow-hidden justify-between">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 shrink-0">
              <h3 className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Extracted Fields
              </h3>
              <span className="text-[11px] text-neutral-400">Edit inline</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {Object.entries(fields).map(([key, fieldData]) => {
                const label =
                  FIELD_LABELS[key] ||
                  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                const isHighConfidence = fieldData.confidence >= 85;
                const isBlank = !fieldData.value || fieldData.value.trim().length === 0;

                return (
                  <div
                    key={key}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      isBlank
                        ? "border-amber-200/80 bg-amber-50"
                        : isHighConfidence
                        ? "border-neutral-200/80 bg-neutral-50/50"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-neutral-600 flex items-center gap-1.5">
                        <span>{label}</span>
                        {isBlank && (
                          <span className="text-[9px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                            Needs input
                          </span>
                        )}
                      </label>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isBlank
                            ? "bg-amber-50 text-amber-700"
                            : isHighConfidence
                            ? "bg-neutral-100 text-neutral-600"
                            : "bg-neutral-50 text-neutral-500"
                        }`}
                      >
                        {isBlank
                          ? "Empty"
                          : isHighConfidence
                          ? `${fieldData.confidence}%`
                          : `${fieldData.confidence}%`}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={fieldData.value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        placeholder="[Not detected — enter manually]"
                        className={`w-full text-xs py-1.5 px-2.5 rounded-md border transition-colors ${
                          isBlank
                            ? "bg-white border-amber-200/80 text-gurukul-dark placeholder-neutral-400 focus:border-neutral-400"
                            : "bg-white border-neutral-200 text-gurukul-dark focus:border-neutral-400"
                        } focus:outline-none`}
                      />
                      <Edit3 className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between shrink-0">
            <p className="text-[11px] text-neutral-400">
              Review details, edit if needed, then approve.
            </p>
            <button
              onClick={handleApprove}
              className="bg-gurukul-dark hover:bg-neutral-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve & Create Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
