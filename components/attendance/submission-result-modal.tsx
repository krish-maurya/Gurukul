"use client";

import React from "react";
import { AlertCircle, Check, X } from "lucide-react";

interface SubmissionResultModalProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

export function SubmissionResultModal({ type, title, message, onClose }: SubmissionResultModalProps) {
  const isSuccess = type === "success";

  return (
    <div className="attendance-result-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4" role="alertdialog" aria-modal="true">
      <div className="attendance-result-card relative w-full max-w-xs overflow-hidden rounded-xl border border-neutral-200 bg-white px-6 pb-6 pt-8 text-center shadow-modal animate-scale-in">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>

        <div className={`attendance-result-icon relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
          isSuccess ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
        }`}>
          {isSuccess ? (
            <Check className="h-6 w-6 text-emerald-600" strokeWidth={2.5} />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-500" strokeWidth={2} />
          )}
        </div>

        <h2 className="text-sm font-semibold tracking-tight text-gurukul-dark">{title}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-neutral-500">{message}</p>

        <button onClick={onClose} className={`mt-5 w-full rounded-lg px-4 py-2.5 text-xs font-medium transition-colors ${
          isSuccess
            ? "bg-gurukul-dark text-white hover:bg-neutral-800"
            : "bg-white border border-neutral-200 text-gurukul-dark hover:bg-neutral-50"
        }`}>
          {isSuccess ? "Done" : "Try Again"}
        </button>
      </div>
    </div>
  );
}
