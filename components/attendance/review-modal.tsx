"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, ArrowLeft, Send, RotateCcw } from "lucide-react";

interface StudentRollInfo {
  rollNumber: number;
  id: string;
  name: string;
  status: "PRESENT" | "ABSENT";
}

interface ReviewModalProps {
  grade: string;
  section: string;
  date: string;
  students: StudentRollInfo[];
  absentRolls: number[];
  isSubmitting: boolean;
  onConfirmSubmit: () => void;
  onClose: () => void;
  isEditMode?: boolean;
}

export function ReviewModal({
  grade,
  section,
  date,
  students,
  absentRolls,
  isSubmitting,
  onConfirmSubmit,
  onClose,
  isEditMode,
}: ReviewModalProps) {
  const absentStudents = students.filter((s) => absentRolls.includes(s.rollNumber));
  const presentCount = students.length - absentRolls.length;

  return (
    <div className="fixed inset-0 z-50 bg-gurukul-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gurukul-gray shadow-floating max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-6 border-b border-gurukul-gray bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gurukul-dark">
                {isEditMode ? "Update Attendance Review" : "Attendance Final Review"}
              </h3>
              <span className="text-[10px] bg-gurukul-tech text-white font-bold px-2 py-0.5 rounded">
                Review & Submit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {grade} (Sec {section}) • Daily attendance • {date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Present Count</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{presentCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Absent Count</p>
              <p className="text-2xl font-bold text-rose-900 mt-1">{absentRolls.length}</p>
            </div>
          </div>

          {/* Absentee List Breakdown */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Marked Absent Absentees ({absentRolls.length}):
            </label>

            {absentRolls.length > 0 ? (
              <div className="max-h-48 overflow-y-auto border border-rose-200 bg-rose-50/40 rounded-xl divide-y divide-rose-100">
                {absentStudents.map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                        #{s.rollNumber}
                      </span>
                      <span className="font-semibold text-gurukul-dark">{s.name}</span>
                    </div>
                    <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded uppercase">
                      ABSENT
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-medium">
                🎉 Perfect Attendance! All {students.length} students are present today.
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            Attendance for all {students.length} students will be saved together when you submit.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gurukul-gray bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold text-slate-600 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-colors border border-gurukul-gray"
          >
            Go Back & Edit
          </button>

          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isEditMode ? "Confirm & Update" : "Confirm & Write Record"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
