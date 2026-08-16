"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";

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
    <div className="bg-white rounded-xl border border-neutral-200/80 p-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gurukul-dark flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span>Scan Admission Forms</span>
          </h3>
          <p className="text-[11px] text-gurukul-ocean mt-0.5">
            Upload a photo or scan — details are read automatically.
          </p>
        </div>

        {/* Quick Demo Pre-load Triggers */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">Samples:</span>
          <button
            onClick={() => onFileSelect("Admission_Form_Aarav_Sharma.pdf")}
            disabled={isProcessing}
            className="text-[11px] bg-neutral-50 hover:bg-neutral-100 text-gurukul-dark font-medium px-2.5 py-1 rounded-md transition-colors border border-neutral-200 disabled:opacity-40"
          >
            Aarav Sharma (Flagged)
          </button>
          <button
            onClick={() => onFileSelect("Admission_Form_Sophia_Chen.pdf")}
            disabled={isProcessing}
            className="text-[11px] bg-neutral-50 hover:bg-neutral-100 text-gurukul-dark font-medium px-2.5 py-1 rounded-md transition-colors border border-neutral-200 disabled:opacity-40"
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
        className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragging
            ? "border-neutral-400 bg-neutral-50"
            : "border-neutral-300 hover:border-neutral-400"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
          className="hidden"
        />

        <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-2.5">
          <UploadCloud className="w-4 h-4" />
        </div>

        <p className="text-xs font-medium text-gurukul-dark">
          Drop your document here, or click to browse
        </p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          PNG, JPG, WebP, or PDF
        </p>

        {isProcessing && (
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <div className="w-4 h-4 border-2 border-neutral-300 border-t-gurukul-dark rounded-full animate-spin" />
            <span className="text-[11px] text-gurukul-ocean font-medium">
              {ocrProgressStatus || "Reading the document..."}
            </span>
            <p className="text-[10px] text-neutral-400">
              Undetected fields will be left blank for manual entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
