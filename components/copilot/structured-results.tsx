"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, FileText, Calendar, ArrowRight, Phone, CheckCircle2 } from "lucide-react";
import { CopilotToolResult, RiskStudent } from "@/lib/copilot/tools";

interface StructuredResultsProps {
  result: CopilotToolResult;
}

export function StructuredResults({ result }: StructuredResultsProps) {
  if (result.toolName === "getStudentsAtRisk") {
    const students: RiskStudent[] = result.data;
    return (
      <div className="mt-3 bg-white rounded-xl border border-gurukul-gray p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-gurukul-gray pb-2">
          <span className="text-xs font-bold text-gurukul-dark flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Filtered Table: Students Below 75% Attendance
          </span>
          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
            {students.length} Flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[9px]">
              <tr>
                <th className="p-2">Roll</th>
                <th className="p-2">Student Name</th>
                <th className="p-2">Grade</th>
                <th className="p-2">Attendance %</th>
                <th className="p-2">Absent Days</th>
                <th className="p-2 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {students.map((s) => (
                <tr key={s.rollNumber} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-gurukul-dark">#{s.rollNumber}</td>
                  <td className="p-2 text-gurukul-dark font-semibold">{s.name}</td>
                  <td className="p-2 text-slate-600">{s.grade}</td>
                  <td className="p-2 text-rose-600 font-bold font-mono">{s.attendancePct}%</td>
                  <td className="p-2 text-slate-700">{s.absentDays} Days</td>
                  <td className="p-2 text-right text-slate-500 font-mono text-[10px]">
                    {s.contact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Automated SMS alerts sent to guardians.</span>
          <Link href="/students" className="text-gurukul-tech hover:underline font-semibold flex items-center gap-1">
            <span>View Student Registry</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  if (result.toolName === "getPendingDocuments") {
    const docs = result.data;
    return (
      <div className="mt-3 bg-white rounded-xl border border-gurukul-gray p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-gurukul-gray pb-2">
          <span className="text-xs font-bold text-gurukul-dark flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gurukul-tech" />
            Inline Card: Pending Document Intelligence OCR
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
            Needs Review
          </span>
        </div>

        {docs.map((d: any) => (
          <div key={d.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gurukul-dark">{d.fileName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Applicant: {d.extractedName} ({d.grade}) • OCR Score: <strong className="text-amber-600">{d.confidence}%</strong>
              </p>
            </div>
            <Link
              href="/documents"
              className="text-xs bg-gurukul-tech text-white font-medium px-3 py-1.5 rounded-md hover:bg-gurukul-tech/90 transition-colors shadow-xs"
            >
              Open Review Panel
            </Link>
          </div>
        ))}
      </div>
    );
  }

  if (result.toolName === "getTimetableConflicts") {
    const conflicts = result.data;
    return (
      <div className="mt-3 bg-white rounded-xl border border-gurukul-gray p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-gurukul-gray pb-2">
          <span className="text-xs font-bold text-gurukul-dark flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            Inline Card: Master Timetable Clashes
          </span>
          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
            {conflicts.length} Clashes
          </span>
        </div>

        {conflicts.map((c: any) => (
          <div key={c.id} className="p-3 bg-rose-50/50 rounded-lg border border-rose-200 space-y-1">
            <p className="text-xs font-bold text-rose-900">{c.type.replace("_", " ")}</p>
            <p className="text-[11px] text-slate-700">{c.description}</p>
            <p className="text-[10px] text-gurukul-tech font-semibold">Suggested Fix: {c.suggestedFix}</p>
          </div>
        ))}

        <Link
          href="/timetable"
          className="block text-center text-xs bg-gurukul-dark text-white font-semibold py-2 rounded-lg hover:bg-gurukul-dark/90 transition-colors"
        >
          Launch Timetable Inspector Matrix
        </Link>
      </div>
    );
  }

  return null;
}
