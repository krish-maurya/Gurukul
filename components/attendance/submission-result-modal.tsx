"use client";

import React, { type CSSProperties } from "react";
import { AlertCircle, Check, X } from "lucide-react";

interface SubmissionResultModalProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

/** A focused confirmation state, similar to a payment-success receipt. */
export function SubmissionResultModal({ type, title, message, onClose }: SubmissionResultModalProps) {
  const isSuccess = type === "success";
  const confetti = [{ x: -48, y: -38, color: "#fb7185", delay: "0ms" }, { x: 48, y: -34, color: "#38bdf8", delay: "80ms" }, { x: -42, y: 42, color: "#84cc16", delay: "30ms" }, { x: 44, y: 42, color: "#fbbf24", delay: "130ms" }];

  return (
    <div className="attendance-result-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-gurukul-dark/65 p-4 backdrop-blur-md" role="alertdialog" aria-modal="true" aria-labelledby="attendance-result-title">
      <div className={`attendance-result-card relative w-full max-w-sm overflow-hidden rounded-3xl border bg-white px-7 pb-7 pt-9 text-center shadow-2xl sm:px-8 ${isSuccess ? "border-emerald-100" : "border-rose-100"}`}>
        <div className={`absolute inset-x-0 top-0 h-1.5 ${isSuccess ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400" : "bg-gradient-to-r from-rose-400 via-red-500 to-rose-400"}`} />
        <button onClick={onClose} className="absolute right-5 top-5 z-10 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close message"><X className="h-4 w-4" /></button>
        <div className={`attendance-result-icon relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${isSuccess ? "bg-gradient-to-br from-[#10aeb4] to-[#087e9a]" : "bg-gradient-to-br from-rose-400 to-red-600"}`}>
          {isSuccess && <>
            <div className="attendance-confetti" aria-hidden="true">{confetti.map((piece, index) => <span key={index} style={{ "--x": `${piece.x}px`, "--y": `${piece.y}px`, "--confetti-color": piece.color, animationDelay: piece.delay } as CSSProperties} />)}</div>
            <span className="attendance-result-ring absolute inset-[-10px] rounded-full border border-cyan-300/70" />
          </>}
          {isSuccess ? <Check className="h-10 w-10 text-white" strokeWidth={3} /> : <AlertCircle className="h-10 w-10 text-white" strokeWidth={2.5} />}
        </div>
        <h2 id="attendance-result-title" className="text-xl font-extrabold tracking-tight text-gurukul-dark">{title}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">{message}</p>
        <button onClick={onClose} className={`mt-6 w-full rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] ${isSuccess ? "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-700" : "bg-rose-600 shadow-rose-600/25 hover:bg-rose-700"}`}>{isSuccess ? "Done" : "Try Again"}</button>
      </div>
    </div>
  );
}
