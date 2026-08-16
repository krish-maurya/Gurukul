"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ReviewModal } from "@/components/attendance/review-modal";
import { SubmissionResultModal } from "@/components/attendance/submission-result-modal";
import { useAuth } from "@/lib/auth/session-context";
import { Calendar, CheckCircle2, Edit3, Filter, Loader2, Send } from "lucide-react";

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

  // Build the screen from one real roster and one daily record so async calls never overwrite each other.
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
      setResult({ type: "success", title: "Attendance submitted", message: `${grade} attendance for ${date} has been securely saved. ${students.length} students were recorded.` });
    } catch (error) {
      setIsModalOpen(false); setResult({ type: "error", title: "Submission failed", message: error instanceof Error ? error.message : "Please check your connection and try again." });
    } finally { setIsSubmitting(false); }
  };

  const absentRollNumbers = useMemo(() => students.filter((student) => student.status === "ABSENT").map((student) => student.rollNumber), [students]);
  const presentCount = students.length - absentRollNumbers.length;

  return <div className="space-y-6 pb-28">
    <div className="flex flex-col gap-4 border-b border-gurukul-gray pb-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h1 className="text-xl font-bold tracking-tight text-gurukul-dark">Daily Attendance</h1><span className="rounded bg-gurukul-tech px-2 py-0.5 text-[10px] font-bold uppercase text-white">One per day</span></div><p className="mt-1 text-xs text-slate-500">Mark the class once for a date. Tap a roll number to change its status.</p></div>{isSubmitted && <button onClick={() => setIsSubmitted(false)} className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-200"><Edit3 className="h-3.5 w-3.5" />Correct daily attendance</button>}</div>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gurukul-gray bg-white p-4 shadow-subtle"><div className="flex flex-wrap items-center gap-4 text-xs"><div className="flex items-center gap-2"><Filter className="h-4 w-4 text-slate-400" /><span className="font-semibold text-slate-700">Class:</span><select value={grade} onChange={(event) => setGrade(event.target.value)} className="rounded-lg border border-gurukul-gray bg-slate-50 px-3 py-1.5 text-xs font-semibold text-gurukul-dark focus:border-gurukul-tech focus:outline-none"><option value="Grade 10A">Grade 10A</option><option value="Grade 11B">Grade 11B</option><option value="Grade 12A">Grade 12A</option></select></div><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gurukul-ocean" /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-gurukul-gray bg-slate-50 px-3 py-1.5 text-xs font-semibold text-gurukul-dark focus:border-gurukul-tech focus:outline-none" /></div></div><div className="text-xs font-medium text-slate-500">Faculty: <strong className="text-gurukul-dark">{currentUser?.name || "Faculty Member"}</strong></div></div>
    {isSubmitted && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />Daily attendance for {grade} on {date} is saved. You can correct it if needed.</div>}
    <div className="rounded-xl border border-gurukul-gray bg-white p-6 shadow-subtle"><div className="mb-4 flex items-center justify-between border-b border-gurukul-gray pb-3"><div><h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{grade} roll number grid</h3><p className="mt-0.5 text-xs text-slate-400">Green is present; tap a tile to mark absent.</p></div><div className="flex gap-3 text-xs font-medium"><span className="flex items-center gap-1.5 text-slate-600"><i className="h-3 w-3 rounded bg-emerald-500" />Present</span><span className="flex items-center gap-1.5 text-slate-600"><i className="h-3 w-3 rounded bg-rose-600" />Absent</span></div></div>{isLoading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Loading class roster…</div> : students.length === 0 ? <div className="flex min-h-64 items-center justify-center text-center text-sm text-slate-500">No students are enrolled in {grade} yet.</div> : <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">{students.map((student) => { const isAbsent = student.status === "ABSENT"; return <button key={student.id} onClick={() => handleToggleRoll(student.rollNumber)} disabled={isSubmitted} className={`flex h-20 flex-col items-center justify-center rounded-xl border-2 shadow-xs transition-all duration-150 ${isAbsent ? "scale-[.98] border-rose-700 bg-rose-600 text-white shadow-md" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 hover:border-emerald-500/50 hover:bg-emerald-500/20"} ${isSubmitted ? "cursor-not-allowed opacity-90" : "active:scale-95"}`}><span className={`text-xs font-bold ${isAbsent ? "text-rose-100" : "text-emerald-800"}`}>ROLL</span><span className={`font-mono text-xl font-extrabold leading-tight ${isAbsent ? "text-white" : "text-emerald-900"}`}>#{student.rollNumber}</span><span className={`mt-0.5 text-[9px] font-bold tracking-wider ${isAbsent ? "rounded bg-rose-800/80 px-1.5 text-white" : "text-emerald-700"}`}>{student.status}</span></button>; })}</div>}</div>
    <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-4 border-t border-gurukul-dark bg-gurukul-dark p-4 text-white shadow-floating md:left-64 md:px-8"><div className="flex min-w-0 items-center gap-4 sm:gap-6"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-gurukul-ocean">Daily summary</p><p className="mt-0.5 truncate text-sm font-bold">{grade} · {date}</p></div><div className="hidden h-8 w-px bg-white/10 sm:block" /><div className="hidden gap-4 text-xs sm:flex"><span>Roll: <strong>{students.length}</strong></span><span className="text-emerald-400">Present: <strong className="text-white">{presentCount}</strong></span><span className="text-rose-400">Absent: <strong className="text-white">{absentRollNumbers.length}</strong></span></div></div><button onClick={() => setIsModalOpen(true)} disabled={isSubmitted || isLoading || students.length === 0} className="flex shrink-0 items-center gap-2 rounded-lg bg-gurukul-tech px-4 py-3 text-xs font-bold text-white transition-all hover:bg-gurukul-tech/90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"><Send className="h-4 w-4" /><span className="hidden sm:inline">{isSubmitted ? "Submitted" : "Review & Submit"}</span><span className="sm:hidden">Submit</span></button></div>
    {isModalOpen && <ReviewModal grade={grade} section={section} date={date} students={students} absentRolls={absentRollNumbers} isSubmitting={isSubmitting} onConfirmSubmit={handleConfirmSubmit} onClose={() => setIsModalOpen(false)} isEditMode={isSubmitted} />}
    {result && <SubmissionResultModal {...result} onClose={() => setResult(null)} />}
  </div>;
}
