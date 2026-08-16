"use client";

import React, { useState, useEffect } from "react";
import { ReviewModal } from "@/components/attendance/review-modal";
import { useAuth } from "@/lib/auth/session-context";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Send, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from "lucide-react";

interface StudentRollState {
  id: string;
  rollNumber: number;
  name: string;
  status: "PRESENT" | "ABSENT";
}

export default function AttendancePage() {
  const { currentUser } = useAuth();
  const [grade, setGrade] = useState("Grade 10A");
  const [section, setSection] = useState("A");
  const [period, setPeriod] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [students, setStudents] = useState<StudentRollState[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 40; // All 40 roll numbers fit in crisp 8x5 grid

  // Load students for chosen class
  useEffect(() => {
    // Keep a visual fallback while the registry loads, then use real IDs for the
    // atomic attendance submission (AttendanceEntry has a database relation).
    const generateStudents = () => {
      const list: StudentRollState[] = [];
      for (let i = 1; i <= 40; i++) {
        list.push({
          id: `std-10a-${i}`,
          rollNumber: i,
          name: `Student Roll #${i}`,
          status: "PRESENT",
        });
      }
      return list;
    };

    setStudents(generateStudents());
    setIsSubmitted(false);

    fetch("/api/students")
      .then((res) => res.ok ? res.json() : [])
      .then((records: Array<{ id: string; rollNumber: number; name: string; grade: string }>) => {
        const classStudents = records
          .filter((student) => student.grade === grade)
          .sort((a, b) => a.rollNumber - b.rollNumber)
          .map((student) => ({ id: student.id, rollNumber: student.rollNumber, name: student.name, status: "PRESENT" as const }));
        if (classStudents.length) setStudents(classStudents);
      })
      .catch(() => {});

    // Check if existing record exists for today
    fetch(`/api/attendance?grade=${encodeURIComponent(grade)}&date=${date}&period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.record && data.record.entries) {
          setIsSubmitted(true);
          const entriesMap: Record<number, "PRESENT" | "ABSENT"> = {};
          data.record.entries.forEach((e: { rollNumber: number; status: string }) => {
            entriesMap[e.rollNumber] = e.status as "PRESENT" | "ABSENT";
          });

          setStudents((prev) =>
            prev.map((s) => ({
              ...s,
              status: entriesMap[s.rollNumber] || "PRESENT",
            }))
          );
        }
      })
      .catch(() => {});
  }, [grade, section, period, date]);

  // One-tap roll number toggle: PRESENT <-> ABSENT
  const handleToggleRoll = (rollNumber: number) => {
    if (isSubmitted) return; // Must click "Reopen / Correct Today's Attendance" to edit
    setStudents((prev) =>
      prev.map((s) => (s.rollNumber === rollNumber ? { ...s, status: s.status === "PRESENT" ? "ABSENT" : "PRESENT" } : s))
    );
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      grade,
      section,
      date,
      period,
      teacherId: currentUser?.id || "staff-turing",
      entries: students.map((s) => ({
        studentId: s.id,
        rollNumber: s.rollNumber,
        status: s.status,
      })),
    };

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const absentRollNumbers = students.filter((s) => s.status === "ABSENT").map((s) => s.rollNumber);
  const presentCount = students.length - absentRollNumbers.length;

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gurukul-gray pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">
              Grid-Based Attendance Intake
            </h1>
            <span className="text-[10px] bg-gurukul-tech text-white font-bold px-2 py-0.5 rounded uppercase">
              Quick Save
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tap a roll number to mark a student absent or present, then submit once when you are done.
          </p>
        </div>

        {/* Re-open / Edit Control if already submitted */}
        {isSubmitted && (
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs px-4 py-2 rounded-lg border border-amber-300 transition-all flex items-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Reopen & Correct Today's Roll</span>
          </button>
        )}
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white rounded-xl border border-gurukul-gray p-4 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Class:</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="bg-slate-50 border border-gurukul-gray text-xs font-semibold text-gurukul-dark rounded-lg px-3 py-1.5 focus:outline-none focus:border-gurukul-tech"
            >
              <option value="Grade 10A">Grade 10A</option>
              <option value="Grade 11B">Grade 11B</option>
              <option value="Grade 12A">Grade 12A</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value))}
              className="bg-slate-50 border border-gurukul-gray text-xs font-semibold text-gurukul-dark rounded-lg px-3 py-1.5 focus:outline-none focus:border-gurukul-tech"
            >
              <option value={1}>Period 1 (09:00 AM)</option>
              <option value={2}>Period 2 (10:00 AM)</option>
              <option value={3}>Period 3 (11:00 AM)</option>
              <option value={4}>Period 4 (12:00 PM)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gurukul-ocean" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-50 border border-gurukul-gray text-xs font-semibold text-gurukul-dark rounded-lg px-3 py-1.5 focus:outline-none focus:border-gurukul-tech"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Faculty: <strong className="text-gurukul-dark">{currentUser?.name || "Faculty Member"}</strong>
        </div>
      </div>

      {isSubmitted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Attendance for {grade} Period {period} was submitted & verified in database. Click "Reopen & Correct" to make changes.</span>
          </div>
        </div>
      )}

      {/* Paginated 8-Column Roll Number Grid (Sorted Numerically 1 to 40) */}
      <div className="bg-white rounded-xl border border-gurukul-gray p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gurukul-gray">
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {grade} Roll Number Grid (1 to 40)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tap a roll number tile to mark ABSENT. Tap again to revert to PRESENT.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-600">Present (Default)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-600" />
              <span className="text-slate-600">Absent (Toggled)</span>
            </div>
          </div>
        </div>

        {/* 8-Column Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {students.map((student) => {
            const isAbsent = student.status === "ABSENT";
            return (
              <button
                key={student.rollNumber}
                onClick={() => handleToggleRoll(student.rollNumber)}
                disabled={isSubmitted}
                className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-150 select-none shadow-xs ${
                  isAbsent
                    ? "bg-rose-600 border-rose-700 text-white shadow-md scale-98"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                } ${isSubmitted ? "cursor-not-allowed opacity-90" : "cursor-pointer active:scale-95"}`}
              >
                <span className={`text-xs font-bold tracking-tight ${isAbsent ? "text-rose-100" : "text-emerald-800"}`}>
                  ROLL
                </span>
                <span className={`text-xl font-extrabold font-mono leading-tight ${isAbsent ? "text-white" : "text-emerald-900"}`}>
                  #{student.rollNumber}
                </span>
                <span className={`text-[9px] font-bold uppercase mt-0.5 tracking-wider ${isAbsent ? "text-white bg-rose-800/80 px-1.5 py-0.2 rounded" : "text-emerald-700"}`}>
                  {isAbsent ? "ABSENT" : "PRESENT"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Summary Bar & Review & Submit Trigger */}
      <div className="fixed bottom-0 left-64 right-0 bg-gurukul-dark text-white p-4 border-t border-gurukul-dark shadow-floating z-30 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] text-gurukul-ocean font-semibold uppercase tracking-wider">Class Summary</p>
            <p className="text-sm font-bold text-white mt-0.5">{grade} (Sec {section}) • Period {period}</p>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-gurukul-gray">Total Roll: </span>
              <strong className="text-white font-mono">{students.length}</strong>
            </div>
            <div>
              <span className="text-emerald-400 font-medium">Present: </span>
              <strong className="text-white font-mono">{presentCount}</strong>
            </div>
            <div>
              <span className="text-rose-400 font-medium">Absent: </span>
              <strong className="text-white font-mono">{absentRollNumbers.length}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isSubmitted}
          className="bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitted ? "Submitted & Locked" : "Review & Submit Attendance"}</span>
        </button>
      </div>

      {/* Review Confirmation Modal */}
      {isModalOpen && (
        <ReviewModal
          grade={grade}
          section={section}
          period={period}
          date={date}
          students={students}
          absentRolls={absentRollNumbers}
          isSubmitting={isSubmitting}
          onConfirmSubmit={handleConfirmSubmit}
          onClose={() => setIsModalOpen(false)}
          isEditMode={isSubmitted}
        />
      )}
    </div>
  );
}
