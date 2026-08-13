"use client";

import React from "react";
import { TimetableConflictDetail } from "@/lib/timetable/optimizer";
import { generateAIConflictExplanation } from "@/lib/timetable/ai-explainer";
import { AlertOctagon, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";

interface ConflictPanelProps {
  conflicts: TimetableConflictDetail[];
  selectedConflict: TimetableConflictDetail | null;
  onSelectConflict: (conflict: TimetableConflictDetail) => void;
  onApplyFix: (conflict: TimetableConflictDetail) => void;
  onApproveTimetable: () => void;
}

export function ConflictPanel({
  conflicts,
  selectedConflict,
  onSelectConflict,
  onApplyFix,
  onApproveTimetable,
}: ConflictPanelProps) {
  const activeConflict = selectedConflict || (conflicts.length > 0 ? conflicts[0] : null);
  const aiExplanation = activeConflict ? generateAIConflictExplanation(activeConflict) : null;

  return (
    <div className="bg-white rounded-xl border border-gurukul-gray shadow-card p-6 flex flex-col justify-between h-full">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gurukul-gray mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gurukul-tech" />
            <h3 className="text-sm font-semibold text-gurukul-dark">AI Intelligence & Clash Inspector</h3>
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
              conflicts.length > 0
                ? "bg-rose-100 text-rose-800 border border-rose-200"
                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}
          >
            {conflicts.length > 0 ? `${conflicts.length} Conflict(s) Detected` : "Schedule Optimal"}
          </span>
        </div>

        {conflicts.length > 0 ? (
          <div className="space-y-5">
            {/* Conflict List Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Active Schedule Clashes
              </label>
              <div className="space-y-2">
                {conflicts.map((c, i) => {
                  const isSelected = activeConflict?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelectConflict(c)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? "border-rose-500 bg-rose-50/50 shadow-xs font-semibold text-gurukul-dark"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-700">Clash #{i + 1}: {c.type.replace("_", " ")}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.day} P{c.period}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-1">{c.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Explanation Card */}
            {aiExplanation && activeConflict && (
              <div className="bg-slate-50 rounded-xl border border-gurukul-gray p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-bold text-gurukul-dark flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gurukul-tech" />
                    Plain-Language AI Diagnosis
                  </span>
                  <span className="text-[10px] font-mono text-gurukul-tech bg-gurukul-tech/10 px-2 py-0.5 rounded">
                    Confidence {(aiExplanation.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-rose-700 mb-1">{aiExplanation.headline}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{aiExplanation.cause}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-gurukul-tech uppercase tracking-wider block">
                    Recommended AI Optimization Fix:
                  </span>
                  <p className="text-xs text-gurukul-dark font-medium leading-relaxed">
                    {aiExplanation.recommendation}
                  </p>

                  <button
                    onClick={() => onApplyFix(activeConflict)}
                    className="w-full mt-2 bg-gurukul-tech hover:bg-gurukul-tech/90 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Apply 1-Click Suggested Fix</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Zero Conflicts State */
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gurukul-dark">Schedule Conflict-Free</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              All constraint rules (teacher workload, room double-booking, and capacity) are fully satisfied.
            </p>
          </div>
        )}
      </div>

      {/* Approve Action */}
      <div className="pt-5 border-t border-gurukul-gray mt-6">
        <button
          onClick={onApproveTimetable}
          disabled={conflicts.length > 0}
          className="w-full bg-gurukul-dark hover:bg-gurukul-dark/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs py-3 px-4 rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-gurukul-ocean" />
          <span>Approve & Publish Master Timetable</span>
        </button>
        {conflicts.length > 0 && (
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Resolve all critical clashes before publishing schedule.
          </p>
        )}
      </div>
    </div>
  );
}
