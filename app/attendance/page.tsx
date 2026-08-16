"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ReviewModal } from "@/components/attendance/review-modal";
import { SubmissionResultModal } from "@/components/attendance/submission-result-modal";
import { useAuth } from "@/lib/auth/session-context";
import { Calendar, CheckCircle2, Edit3, Filter, Loader2, Send } from "lucide-react";
import { PageLoader, SkeletonGrid } from "@/components/ui/loaders";

interface StudentRollState { id: string; rollNumber: number; name: string; status: "PRESENT" | "ABSENT"; }
type Result = { type: "success" | "error"; title: string; message: string };

export default function AttendancePage() {
  const { currentUser } = useAuth();
  const [grade, setGrade] = useState("Grade 10A");
  const [section] = useState("A");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<StudentRollState[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true); setIsSubmitted(false); setStudents([]);
    Promise.all([
      fetch("/api/students", { signal: controller.signal }).then(async (response) => {
        if (!response.ok) throw new Error("Could not load the class roster.");
        return response.json() as Promise<Array<{ id: string; rollNumber: number; name: string; grade: string }>>;
      }),
      fetch(`/api/attendance?grade=${encodeURIComponent(grade)}&section=${encodeURIComponent(section)}&date=${encodeURIComponent(date)}`, { signal: controller.signal }).then(async (response) => {
        if (!response.ok) throw new Error("Could not load saved attendance.");
        return response.json() as Promise<{ record: { entries: Array<{ rollNumber: number; status: string }> } | null }>;
      }),
    ]).then(([records, attendance]) => {
      const saved = new Map((attendance.record?.entries ?? []).map((entry) => [entry.rollNumber, entry.status as StudentRollState["status"]]));
      setStudents(records.filter((student) => student.grade === grade).sort((a, b) => a.rollNumber - b.rollNumber).map((student) => ({ ...student, status: saved.get(student.rollNumber) ?? "PRESENT" })));
      setIsSubmitted(Boolean(attendance.record));
    }).catch((error: unknown) => {
      if ((error as Error).name !== "AbortError") setResult({ type: "error", title: "Attendance could not load", message: error instanceof Error ? error.message : "Please refresh and try again." });
    }).finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [grade, section, date]);

  const handleToggleRoll = (rollNumber: number) => {
    if (isSubmitted) return;
    setStudents((current) => current.map((student) => student.rollNumber === rollNumber ? { ...student, status: student.status === "PRESENT" ? "ABSENT" : "PRESENT" } : student));
  };

  const handleConfirmSubmit = async () => {
    if (!students.length) { setIsModalOpen(false); setResult({ type: "error", title: "No students to submit", message: "This class does not have a saved student roster yet." }); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade, section, date, entries: students.map(({ id, status }) => ({ studentId: id, status })) }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The attendance record could not be saved.");
      setIsSubmitted(true); setIsModalOpen(false);
      setResult({ type: "success", title: "Attendance submitted", message: `${grade} attendance for ${date} has been saved. ${students.length} students recorded.` });
    } catch (error) {
      setIsModalOpen(false); setResult({ type: "error", title: "Submission failed", message: error instanceof Error ? error.message : "Please check your connection and try again." });
    } finally { setIsSubmitting(false); }
  };

  const absentRollNumbers = useMemo(() => students.filter((student) => student.status === "ABSENT").map((student) => student.rollNumber), [students]);
  const presentCount = students.length - absentRollNumbers.length;

  return (
    <div className="space-y-5 pb-28 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-gurukul-dark">Daily Attendance</h1>
            <span className="badge-dark text-[9px]">One per day</span>
          </div>
          <p className="mt-0.5 text-[11px] text-neutral-400">Tap a roll number to toggle present/absent.</p>
        </div>
        {isSubmitted && (
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn-secondary btn-sm"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 card p-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="select text-xs"
            >
              <option value="Grade 10A">Grade 10A</option>
              <option value="Grade 11B">Grade 11B</option>
              <option value="Grade 12A">Grade 12A</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="input text-xs py-1.5 w-auto"
            />
          </div>
        </div>
        <div className="text-[11px] text-neutral-400">
          <strong className="text-gurukul-dark">{currentUser?.name || "Faculty"}</strong>
        </div>
      </div>

      {/* Submitted notice */}
      {isSubmitted && (
        <div className="flex items-center gap-2 card p-3 text-xs text-neutral-600">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Attendance for {grade} on {date} is saved.</span>
        </div>
      )}

      {/* Roll Grid */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2.5">
          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{grade} Roll Grid</h3>
          </div>
          <div className="flex gap-3 text-[10px] font-medium">
            <span className="flex items-center gap-1 text-neutral-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-neutral-100" />
              Present
            </span>
            <span className="flex items-center gap-1 text-neutral-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-gurukul-dark" />
              Absent
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <PageLoader text="Loading roster..." />
          </div>
        ) : students.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center text-xs text-neutral-400">
            No students enrolled in {grade}.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {students.map((student) => {
              const isAbsent = student.status === "ABSENT";
              return (
                <button
                  key={student.id}
                  onClick={() => handleToggleRoll(student.rollNumber)}
                  disabled={isSubmitted}
                  className={`flex h-[72px] flex-col items-center justify-center rounded-lg border transition-all duration-150 ${
                    isAbsent
                      ? "bg-gurukul-dark border-gurukul-dark text-white"
                      : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                  } ${isSubmitted ? "cursor-not-allowed opacity-80" : "active:scale-95"}`}
                >
                  <span className={`text-[9px] font-medium ${isAbsent ? "text-neutral-400" : "text-neutral-400"}`}>
                    ROLL
                  </span>
                  <span className={`font-mono text-lg font-bold leading-tight ${isAbsent ? "text-white" : "text-gurukul-dark"}`}>
                    #{student.rollNumber}
                  </span>
                  <span className={`mt-0.5 text-[8px] font-medium tracking-wider ${isAbsent ? "text-neutral-300" : "text-neutral-400"}`}>
                    {student.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white p-4 shadow-subtle md:left-60 md:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">Summary</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-gurukul-dark">{grade} &middot; {date}</p>
          </div>
          <div className="hidden h-6 w-px bg-neutral-200 sm:block" />
          <div className="hidden gap-4 text-[11px] sm:flex">
            <span className="text-neutral-400">Roll: <strong className="text-gurukul-dark">{students.length}</strong></span>
            <span className="text-neutral-500">Present: <strong className="text-gurukul-dark">{presentCount}</strong></span>
            <span className="text-neutral-400">Absent: <strong className="text-gurukul-dark">{absentRollNumbers.length}</strong></span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isSubmitted || isLoading || students.length === 0}
          className="btn-primary btn-sm"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isSubmitted ? "Submitted" : "Review & Submit"}</span>
        </button>
      </div>

      {isModalOpen && (
        <ReviewModal
          grade={grade}
          section={section}
          date={date}
          students={students}
          absentRolls={absentRollNumbers}
          isSubmitting={isSubmitting}
          onConfirmSubmit={handleConfirmSubmit}
          onClose={() => setIsModalOpen(false)}
          isEditMode={isSubmitted}
        />
      )}
      {result && <SubmissionResultModal {...result} onClose={() => setResult(null)} />}
    </div>
  );
}
