"use client";

import React, { useEffect, useState } from "react";
import { CalendarPlus, X, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";

interface Meta {
  subjects: { id: string; name: string; code: string; requiresLab: boolean }[];
  rooms: { id: string; roomNumber: string; building: string; type: string; capacity: number }[];
  teachers: { id: string; name: string; department: string }[];
  grades: string[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = [1, 2, 3, 4, 5, 6];

export function AddSlotModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { currentUser, isAdmin } = useAuth();
  const [meta, setMeta] = useState<Meta | null>(null);

  const [day, setDay] = useState("Mon");
  const [period, setPeriod] = useState(1);
  const [grade, setGrade] = useState("");
  const [customGrade, setCustomGrade] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const [error, setError] = useState("");
  const [details, setDetails] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/timetable/meta")
      .then((r) => r.json())
      .then((d) => {
        setMeta(d);
        if (d.grades?.length) setGrade(d.grades[0]);
        if (d.subjects?.length) setSubjectId(d.subjects[0].id);
        if (d.rooms?.length) setRoomId(d.rooms[0].id);
        // Teachers are locked to themselves; admins default to first teacher
        if (isAdmin && d.teachers?.length) setTeacherId(d.teachers[0].id);
      })
      .catch(() => setError("Failed to load form data"));
  }, [isAdmin]);

  const effectiveGrade = grade === "__custom__" ? customGrade.trim() : grade;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDetails([]);
    setSuccess("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day,
          period,
          grade: effectiveGrade,
          subjectId,
          roomId,
          ...(isAdmin ? { teacherId } : {}), // server forces own id for teachers
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to create slot");
        setDetails(Array.isArray(data.details) ? data.details : []);
      } else {
        setSuccess(`Added ${data.slot.subjectName} for ${data.slot.grade} — ${data.slot.day} Period ${data.slot.period} in ${data.slot.roomName}`);
        onCreated();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCls =
    "w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-gurukul-tech focus:outline-none";

  return (
    <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-gurukul-tech" />
            <span>{isAdmin ? "Add Timetable Slot" : "Add to My Timetable"}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!meta ? (
          <p className="text-sm text-slate-500 py-8 text-center">{error || "Loading..."}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 font-semibold"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>
                {details.length > 0 && (
                  <ul className="mt-1.5 ml-6 list-disc space-y-0.5">{details.map((d) => <li key={d}>{d}</li>)}</ul>
                )}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" /><span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Day</label>
                <select value={day} onChange={(e) => setDay(e.target.value)} className={selectCls}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Period</label>
                <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className={selectCls}>
                  {PERIODS.map((p) => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Grade / Class</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className={selectCls}>
                {meta.grades.map((g) => <option key={g} value={g}>{g}</option>)}
                <option value="__custom__">+ New grade…</option>
              </select>
              {grade === "__custom__" && (
                <input
                  value={customGrade}
                  onChange={(e) => setCustomGrade(e.target.value)}
                  placeholder="e.g. Grade 9C"
                  required
                  className="mt-2 w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Subject</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={selectCls}>
                {meta.subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code}){s.requiresLab ? " — needs lab" : ""}</option>
                ))}
              </select>
            </div>

            {isAdmin ? (
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Teacher</label>
                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={selectCls}>
                  {meta.teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.department}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                This lecture will be added to <strong>your own</strong> timetable ({currentUser?.name}).
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Room</label>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={selectCls}>
                {meta.rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.roomNumber} · {r.building} · {r.type} (cap {r.capacity})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !effectiveGrade}
                className="flex-1 bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{isSubmitting ? "Checking conflicts..." : "Add Slot"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
