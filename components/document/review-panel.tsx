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
  const [fields, setFields] = useState<Record<string, { value: string; confidence: number }>>({
    studentName: document.extractedFields.studentName,
    dob: document.extractedFields.dob,
    grade: document.extractedFields.grade,
    parentName: document.extractedFields.parentName,
    contact: document.extractedFields.contact,
    address: document.extractedFields.address,
    medicalNotes: document.extractedFields.medicalNotes,
    previousSchool: document.extractedFields.previousSchool,
  });

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gurukul-gray min-h-[500px]">
        {/* Left Column: Scanned Image Preview / Raw OCR Text */}
        <div className="lg:col-span-5 p-6 bg-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gurukul-tech" />
              <span>Original Image / Source Stream</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Tesseract Engine</span>
          </div>

          <div className="flex-1 bg-white rounded-lg border border-slate-300 p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
            {document.fileUrl ? (
              <div className="mb-4 overflow-hidden rounded border border-slate-200 bg-slate-50 flex items-center justify-center max-h-64">
                <img
                  src={document.fileUrl}
                  alt="Original Document Preview"
                  className="max-h-64 object-contain rounded"
                />
              </div>
            ) : (
              <div className="border-b-2 border-gurukul-dark pb-3 mb-3">
                <div className="text-xs font-bold text-gurukul-dark tracking-widest uppercase">GURUKUL ACADEMY</div>
                <div className="text-[10px] text-slate-500">Official Student Intake Record</div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Extracted OCR Text:</span>
              <div className="font-mono text-[11px] text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {document.rawText || "No text could be extracted from image."}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Status: Scanned via Tesseract.js</span>
              <span className="text-gurukul-tech font-medium">Original Upload</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Extracted Fields Form */}
        <div className="lg:col-span-7 p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Extracted Fields (Blank if Not Found in Image)
              </h3>
              <span className="text-xs text-slate-400">Edit any field inline</span>
            </div>

            <div className="space-y-3">
              {Object.entries(fields).map(([key, fieldData]) => {
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());
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

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
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
