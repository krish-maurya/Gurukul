"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

interface FileDropzoneProps {
  onFileSelect: (fileOrName: File | string) => void;
  isProcessing: boolean;
  ocrProgressStatus?: string;
}

export function FileDropzone({ onFileSelect, isProcessing, ocrProgressStatus }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gurukul-gray p-6 shadow-subtle mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gurukul-dark flex items-center gap-2">
            <FileText className="w-4 h-4 text-gurukul-tech" />
            <span>Document Intake & Tesseract OCR Engine</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload any original admission form image (PNG, JPG, WebP) to execute real Tesseract OCR extraction.
          </p>
        </div>

        {/* Quick Demo Pre-load Triggers */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">Quick Samples:</span>
          <button
            onClick={() => onFileSelect("Admission_Form_Aarav_Sharma.pdf")}
            disabled={isProcessing}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-md transition-colors border border-gurukul-gray disabled:opacity-50"
          >
            Aarav Sharma (Flagged)
          </button>
          <button
            onClick={() => onFileSelect("Admission_Form_Sophia_Chen.pdf")}
            disabled={isProcessing}
            className="text-xs bg-gurukul-tech/10 hover:bg-gurukul-tech/20 text-gurukul-tech font-medium px-2.5 py-1 rounded-md transition-colors border border-gurukul-tech/20 disabled:opacity-50"
          >
            Sophia Chen (Passed)
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-gurukul-tech bg-gurukul-tech/5 scale-[0.99]"
            : "border-slate-300 hover:border-gurukul-ocean hover:bg-slate-50/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-medium text-gurukul-dark">
          Click to browse or drag & drop your original document image
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports PNG, JPG, JPEG, WebP, PDF files • Real Tesseract OCR Parsing
        </p>

        {isProcessing && (
          <div className="mt-4 p-3 bg-gurukul-tech/10 rounded-lg border border-gurukul-tech/20 flex flex-col items-center justify-center gap-1.5 text-xs text-gurukul-tech font-semibold animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gurukul-tech" />
              <span>{ocrProgressStatus || "Running Tesseract OCR & Field Extractor..."}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-normal">
              Unmatched fields will be kept blank ("") as per strict system rules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
