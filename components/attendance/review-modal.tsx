"use client";

import React from "react";
import { ArrowLeft, Send, RotateCcw, Loader2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-modal max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gurukul-dark">
              {isEditMode ? "Update Review" : "Confirm Attendance"}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {grade} (Sec {section}) &middot; {date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
              <p className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider">Present</p>
              <p className="text-lg font-bold text-gurukul-dark mt-0.5">{presentCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
              <p className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider">Absent</p>
              <p className="text-lg font-bold text-gurukul-dark mt-0.5">{absentRolls.length}</p>
            </div>
          </div>

          {/* Absentee List */}
          <div>
            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Absent Students ({absentRolls.length})
            </p>

            {absentRolls.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100 custom-scrollbar">
                {absentStudents.map((s) => (
                  <div key={s.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-gurukul-dark text-white font-bold flex items-center justify-center text-[10px]">
                        #{s.rollNumber}
                      </span>
                      <span className="text-[11px] font-medium text-gurukul-dark">{s.name}</span>
                    </div>
                    <span className="badge-default text-[9px]">ABSENT</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center text-xs text-neutral-500">
                All {students.length} students are present.
              </div>
            )}
          </div>

          <p className="text-[10px] text-neutral-400">
            Attendance for {students.length} students will be saved.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-secondary btn-sm"
          >
            Go Back
          </button>

          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="btn-primary btn-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isEditMode ? "Update" : "Submit"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
