"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { GraduationCap, CalendarCheck2, IndianRupee, MessagesSquare, CalendarDays, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface PortalData {
  student: { name: string; grade: string; rollNumber: number; parentName: string; status: string };
  attendance: { totalMarked: number; present: number; absent: number; percentage: number | null; recent: { date: string; status: string }[] };
  fees: { academicYear: string; amountDue: number; amountPaid: number; remaining: number; dueDate: string; status: string; payments: { amount: number; paidAt: string; method: string; receiptNo: string }[] } | null;
  messages: { id: string; type: string; title: string; body: string; status: string; sentAt: string | null; acknowledgedAt: string | null; sentByName: string | null }[];
  timetable: { day: string; period: number; subject: string; teacher: string; room: string }[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function ParentPortalPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showTimetable, setShowTimetable] = useState(false);
  const [ackBusy, setAckBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/portal/${params.token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) setError(d.error || "This link is not valid.");
        else setData(d);
      })
      .catch(() => setError("Could not load. Please check your connection and try again."))
      .finally(() => setIsLoading(false));
  }, [params.token]);

  useEffect(load, [load]);

  const acknowledge = async (messageId: string) => {
    setAckBusy(messageId);
    try {
      await fetch(`/api/portal/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      load();
    } finally { setAckBusy(null); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">{error || "This link is not valid."}</p>
          <p className="text-xs text-slate-400 mt-2">Please ask the school office for a new link.</p>
        </div>
      </div>
    );
  }

  const { student, attendance, fees, messages, timetable } = data;
  const attendanceTone = attendance.percentage === null ? "text-slate-500" : attendance.percentage >= 90 ? "text-emerald-600" : attendance.percentage >= 75 ? "text-amber-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* Header */}
      <div className="bg-gurukul-dark text-white">
        <div className="max-w-lg mx-auto px-5 py-6">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap className="w-5 h-5 text-gurukul-tech" />
            <span className="text-sm font-bold tracking-wide">GURUKUL</span>
            <span className="text-[10px] text-slate-400 ml-auto">Parent Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gurukul-tech/20 text-gurukul-tech font-bold text-lg flex items-center justify-center">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{student.name}</h1>
              <p className="text-xs text-slate-400">{student.grade} · Roll {student.rollNumber}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">Hello {student.parentName}, here is everything about {student.name.split(" ")[0]}'s school life.</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-3 space-y-4">
        {/* Attendance + Fees cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-2">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Attendance</span>
            </div>
            <p className={`text-2xl font-bold ${attendanceTone}`}>
              {attendance.percentage === null ? "—" : `${attendance.percentage}%`}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {attendance.totalMarked > 0 ? `${attendance.present} present · ${attendance.absent} absent (last ${attendance.totalMarked} days)` : "No attendance marked yet"}
            </p>
            {attendance.recent.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap">
                {attendance.recent.slice(0, 14).map((r, i) => (
                  <span key={i} title={`${r.date}: ${r.status}`}
                    className={`w-3 h-3 rounded-sm ${r.status === "PRESENT" ? "bg-emerald-400" : "bg-red-400"}`} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-2">
              <IndianRupee className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">School Fees</span>
            </div>
            {fees ? (
              <>
                <p className={`text-2xl font-bold ${fees.remaining === 0 ? "text-emerald-600" : "text-gurukul-dark"}`}>
                  {fees.remaining === 0 ? "Paid ✓" : `₹${fees.remaining.toLocaleString("en-IN")}`}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {fees.remaining === 0 ? `${fees.academicYear} — all clear` : `remaining of ₹${fees.amountDue.toLocaleString("en-IN")} · due ${fees.dueDate}`}
                </p>
                {fees.payments.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-2">Last payment: ₹{fees.payments[0].amount.toLocaleString("en-IN")} ({fees.payments[0].method})</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 mt-1">No fee account yet</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-1.5">
            <MessagesSquare className="w-3.5 h-3.5 text-gurukul-tech" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Messages from School</span>
            <span className="text-[10px] text-slate-400 ml-auto">{messages.length}</span>
          </div>
          {messages.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No messages yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {messages.map((m) => (
                <div key={m.id} className="px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-gurukul-dark">{m.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{m.sentAt ? new Date(m.sentAt).toLocaleDateString() : ""}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed">{m.body}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-slate-400">{m.sentByName ? `— ${m.sentByName}` : ""}</span>
                    {m.status === "ACKNOWLEDGED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                        <CheckCircle className="w-3 h-3" /> Acknowledged
                      </span>
                    ) : (
                      <button onClick={() => acknowledge(m.id)} disabled={ackBusy === m.id}
                        className="text-[10px] font-semibold text-white bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors">
                        {ackBusy === m.id ? "..." : "Mark as read ✓"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timetable (collapsible) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button onClick={() => setShowTimetable((v) => !v)} className="w-full px-4 py-3 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-gurukul-tech" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{student.grade} Weekly Timetable</span>
            {showTimetable ? <ChevronUp className="w-4 h-4 text-slate-400 ml-auto" /> : <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />}
          </button>
          {showTimetable && (
            <div className="px-4 pb-4 space-y-3">
              {DAYS.map((day) => {
                const slots = timetable.filter((t) => t.day === day).sort((a, b) => a.period - b.period);
                if (slots.length === 0) return null;
                return (
                  <div key={day}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{day}</p>
                    <div className="space-y-1">
                      {slots.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <span className="font-mono text-slate-400 w-6">P{s.period}</span>
                          <span className="font-semibold text-gurukul-dark flex-1">{s.subject}</span>
                          <span className="text-slate-400">{s.teacher.split(" ").slice(-1)[0]} · {s.room}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {timetable.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Timetable not published yet.</p>}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-400 pt-2">
          This is a private page for {student.parentName}. Please don't share the link.
        </p>
      </div>
    </div>
  );
}
