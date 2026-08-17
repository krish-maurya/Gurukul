"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewModal } from "@/components/attendance/review-modal";
import { SubmissionResultModal } from "@/components/attendance/submission-result-modal";
import { useAuth } from "@/lib/auth/session-context";
import { Calendar, CheckCircle2, Edit3, Filter, Loader2, Send } from "lucide-react";
import { PageLoader, SkeletonGrid } from "@/components/ui/loaders";

interface StudentRollState { id: string; rollNumber: number; name: string; status: "PRESENT" | "ABSENT"; }
type Result = { type: "success" | "error"; title: string; message: string };

function AttendanceContent() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const [grades, setGrades] = useState<string[]>([]);
  const [grade, setGrade] = useState("");
  const [section] = useState("A");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<StudentRollState[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Load MY classes (teacher: own timetable classes, admin: all) + default
  useEffect(() => {
    fetch("/api/attendance/grades")
      .then((r) => r.json())
      .then((d) => {
        const list: string[] = d.grades || [];
        setGrades(list);
        const fromUrl = searchParams.get("grade");
        setGrade(fromUrl && list.includes(fromUrl) ? fromUrl : d.defaultGrade || list[0] || "");
      })
      .catch(() => setGrades([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!grade) return;
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
    <div className="space-y-4 pb-24 sm:space-y-5 sm:pb-28 animate-fade-in">
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
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="select min-w-0 flex-1 text-xs sm:w-auto"
            >
              {grades.length === 0 && <option value="">Loading classes...</option>}
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="input min-w-0 flex-1 py-1.5 text-xs sm:w-auto"
            />
          </div>
        </div>
        <div className="hidden text-[11px] text-neutral-400 sm:block">
          <strong className="text-gurukul-dark">{currentUser?.name || "Faculty"}</strong>
        </div>
      </div>

      {/* Submitted notice */}
      {isSubmitted && (
        <div className="flex items-center gap-2 card p-3 text-xs text-neutral-600">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Attendance for {grade} on {date} is already saved — tap <strong>Edit</strong> (top right) to make changes.</span>
        </div>
      )}

      {/* Roll Grid */}
      <div className="card p-3 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 border-b border-neutral-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{grade} Roll Grid</h3>
          </div>
          <div className="flex gap-3 text-[10px] font-medium">
            <span className="flex items-center gap-1 text-neutral-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-neutral-100" />
              Present
            </span>
            <span className="flex items-center gap-1 text-red-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
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
          <div className="grid max-w-6xl grid-cols-3 gap-2 min-[420px]:grid-cols-4 sm:grid-cols-5 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {students.map((student) => {
              const isAbsent = student.status === "ABSENT";
              return (
                <button
                  key={student.id}
                  onClick={() => handleToggleRoll(student.rollNumber)}
                  disabled={isSubmitted}
                  aria-pressed={isAbsent}
                  aria-label={`Roll ${student.rollNumber}: ${student.status.toLowerCase()}. Tap to mark ${isAbsent ? "present" : "absent"}.`}
                  className={`flex h-[84px] flex-col items-center justify-center rounded-xl border transition-all duration-150 sm:h-[88px] ${
                    isAbsent
                      ? "border-red-600 bg-red-600 text-white shadow-sm hover:border-red-700 hover:bg-red-700"
                      : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                  } ${isSubmitted ? "cursor-not-allowed opacity-80" : "active:scale-95"}`}
                >
                  <span className={`text-[9px] font-medium ${isAbsent ? "text-red-100" : "text-neutral-400"}`}>
                    ROLL
                  </span>
                  <span className={`font-mono text-lg font-bold leading-tight ${isAbsent ? "text-white" : "text-gurukul-dark"}`}>
                    #{student.rollNumber}
                  </span>
                  <span className={`mt-0.5 text-[8px] font-medium tracking-wider ${isAbsent ? "text-red-100" : "text-neutral-400"}`}>
                    {student.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-neutral-200 bg-white px-3 py-3 shadow-subtle sm:gap-4 sm:p-4 md:left-60 md:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">Summary</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-gurukul-dark">{grade} &middot; {date}</p>
          </div>
          <div className="hidden h-6 w-px bg-neutral-200 sm:block" />
          <div className="hidden gap-4 text-[11px] sm:flex">
            <span className="text-neutral-400">Roll: <strong className="text-gurukul-dark">{students.length}</strong></span>
            <span className="text-neutral-500">Present: <strong className="text-gurukul-dark">{presentCount}</strong></span>
            <span className="rounded-md bg-red-50 px-2 py-1 text-red-700">Absent: <strong className="text-red-800">{absentRollNumbers.length}</strong></span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isSubmitted || isLoading || students.length === 0}
          className="btn-primary btn-sm shrink-0"
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


export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="flex min-h-52 items-center justify-center text-xs text-neutral-400">Loading...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
