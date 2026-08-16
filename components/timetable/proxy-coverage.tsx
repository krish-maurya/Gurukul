"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Loader2, UserPlus, Sparkles, Check, RefreshCw } from "lucide-react";
import type { AffectedLecture, ScheduleConflict } from "@/lib/timetable/proxy-types";

type Teacher = { id: string; name: string; department: string };

interface ProxyCoverageProps {
  date?: string;
  onDateChange?: (date: string) => void;
  onProxyAssigned?: () => void;
}

export function ProxyCoverage({
  date: controlledDate,
  onDateChange,
  onProxyAssigned,
}: ProxyCoverageProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [date, setDate] = useState(controlledDate || "2026-08-17");
  const [reason, setReason] = useState("");
  const [lectures, setLectures] = useState<AffectedLecture[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reOpening, setReOpening] = useState<Record<string, boolean>>({});

  const loadInitialState = useCallback(async (selectedDate: string, selectedTeacherId?: string) => {
    try {
      const teacherRes = await fetch("/api/timetable/teachers");
      const teacherData = await teacherRes.json();
      const teacherList: Teacher[] = teacherData.teachers ?? [];
      setTeachers(teacherList);

      const targetTeacherId = selectedTeacherId || teacherId || teacherList.find((t) => t.name.includes("Turing"))?.id || teacherList[0]?.id;
      if (targetTeacherId) {
        setTeacherId(targetTeacherId);
        // Query existing affected lectures via GET without mutating
        const absenceRes = await fetch(`/api/timetable/absences?teacherId=${targetTeacherId}&date=${selectedDate}`);
        if (absenceRes.ok) {
          const absenceData = await absenceRes.json();
          setLectures(absenceData.lectures ?? []);
        }
      }

      const conflictRes = await fetch(`/api/timetable/conflicts?date=${selectedDate}`);
      if (conflictRes.ok) {
        const conflictData = await conflictRes.json();
        setConflicts(conflictData.conflicts ?? []);
      }
    } catch {
      // Ignore initial load failure if teacher has no classes scheduled on that day
    }
  }, [teacherId]);

  useEffect(() => {
    if (controlledDate) {
      setDate(controlledDate);
    }
  }, [controlledDate]);

  useEffect(() => {
    loadInitialState(date);
  }, [date, loadInitialState]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    onDateChange?.(newDate);
  };

  async function reportAbsence() {
    if (!teacherId || !date) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/timetable/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, date, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not record absence");
      setLectures(data.lectures ?? []);

      const conflictResponse = await fetch(`/api/timetable/conflicts?date=${date}`);
      if (conflictResponse.ok) {
        const conflictData = await conflictResponse.json();
        setConflicts(conflictData.conflicts ?? []);
      }

      setMessage(
        data.lectures?.length
          ? "Coverage recommendations are ready for administrator review."
          : "No scheduled lectures were affected on this date."
      );
      onProxyAssigned?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not record absence");
    } finally {
      setBusy(false);
    }
  }

  async function reOpenSelection(proxyAssignmentId: string) {
    setReOpening((prev) => ({ ...prev, [proxyAssignmentId]: true }));
    try {
      const recRes = await fetch(`/api/timetable/proxies/${proxyAssignmentId}`);
      if (recRes.ok) {
        const data = await recRes.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setLectures((current) =>
            current.map((l) =>
              l.proxyAssignmentId === proxyAssignmentId
                ? { ...l, recommendations: data.recommendations }
                : l
            )
          );
        }
      }
    } catch {
      // Ignore recommendation refresh error
    }
  }

  async function selectProxy(proxyAssignmentId: string, selectedTeacherId: string) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/timetable/proxies/${proxyAssignmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: selectedTeacherId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not assign proxy teacher");

      // Refetch affected lectures to get the assignedProxyTeacher detail
      const updatedRes = await fetch(`/api/timetable/absences?teacherId=${teacherId}&date=${date}`);
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setLectures(updatedData.lectures ?? []);
      } else {
        setLectures((current) =>
          current.map((lecture) =>
            lecture.proxyAssignmentId === proxyAssignmentId
              ? { ...lecture, status: "ASSIGNED" }
              : lecture
          )
        );
      }

      setReOpening((prev) => ({ ...prev, [proxyAssignmentId]: false }));
      setMessage("Proxy coverage updated successfully. The timetable has been refreshed.");
      onProxyAssigned?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save proxy");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-gurukul-muted" />
          <h2 className="text-sm font-semibold text-gurukul-dark">Teacher Absence & Coverage Dispatch</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            aria-label="Teacher"
            value={teacherId}
            onChange={(event) => setTeacherId(event.target.value)}
            className="select"
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} — {teacher.department}
              </option>
            ))}
          </select>
          <input
            aria-label="Absence date"
            type="date"
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            className="input"
          />
          <input
            aria-label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional reason (e.g. Medical leave)"
            className="input"
          />
          <button
            onClick={reportAbsence}
            disabled={busy || !teacherId}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Mark absent & find coverage</span>
          </button>
        </div>
        {message && <p className="mt-3 text-xs text-gurukul-ocean font-medium">{message}</p>}
      </section>

      {lectures.map((lecture) => {
        const isAssigned = lecture.status === "ASSIGNED";
        const isReOpening = reOpening[lecture.proxyAssignmentId];
        const showRecommendations = !isAssigned || isReOpening;

        return (
          <section key={lecture.proxyAssignmentId} className="card p-5 space-y-4 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-gurukul-gray pb-4">
              <div>
                <h3 className="text-sm font-semibold text-gurukul-dark">
                  {lecture.grade} · {lecture.subject.name}
                </h3>
                <p className="text-xs text-gurukul-ocean mt-1">
                  {lecture.day}, Period {lecture.period} · {lecture.room.roomNumber} · Originally assigned to: <span className="font-medium text-gurukul-dark">{lecture.absentTeacher.name}</span>
                </p>
              </div>
              <span
                className={
                  isAssigned
                    ? "badge-success self-start"
                    : "badge-warning self-start"
                }
              >
                {isAssigned ? "Coverage Assigned" : "Awaiting Selection"}
              </span>
            </div>

            {!showRecommendations ? (
              /* Clean Assigned State Card - Other suggested teachers are hidden once selected */
              <div className="p-4 bg-neutral-50 border border-gurukul-gray rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-neutral-200/80 text-gurukul-dark flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-medium text-gurukul-muted tracking-wider block">
                      Covering Proxy Teacher Assigned
                    </span>
                    <h4 className="text-sm font-semibold text-gurukul-dark">
                      {lecture.assignedProxyTeacher?.name || "Selected Proxy Teacher"}
                    </h4>
                    <p className="text-[11px] text-gurukul-ocean">
                      {lecture.assignedProxyTeacher?.department ? `${lecture.assignedProxyTeacher.department} · ` : ""}Covering for {lecture.absentTeacher.name} on {date} (Period {lecture.period})
                    </p>
                  </div>
                </div>
                <button
                  disabled={busy}
                  onClick={() => reOpenSelection(lecture.proxyAssignmentId)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Change Teacher
                </button>
              </div>
            ) : (
              /* Recommendations Cards Selection */
              lecture.recommendations.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gurukul-ocean font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-gurukul-muted" />
                      <span>Top Proxy Candidates:</span>
                    </div>
                    {isAssigned && (
                      <button
                        onClick={() => setReOpening((prev) => ({ ...prev, [lecture.proxyAssignmentId]: false }))}
                        className="text-xs text-gurukul-ocean hover:text-gurukul-dark transition-colors"
                      >
                        Cancel Reassignment
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {lecture.recommendations.map((candidate, index) => (
                      <article key={candidate.teacherId} className="rounded-lg border border-neutral-200/80 p-4 bg-white flex flex-col justify-between hover:border-neutral-300 transition-colors">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-medium text-sm text-gurukul-dark">{candidate.teacherName}</h4>
                            <span className="badge-default">
                              {candidate.score}/100
                            </span>
                          </div>
                          <p className="text-[11px] text-gurukul-ocean mt-1">
                            Rank #{index + 1} · {candidate.department ?? "Department unavailable"}
                          </p>
                          <p className="text-[11px] text-gurukul-ocean">
                            {candidate.currentLectures} lecture{candidate.currentLectures === 1 ? "" : "s"} today · {candidate.currentProxies} proxy assignment{candidate.currentProxies === 1 ? "" : "s"}
                          </p>
                          <ul className="mt-3 space-y-1 text-xs text-gurukul-ocean">
                            {candidate.reasons.map((item) => (
                              <li key={item} className="flex items-center gap-1.5">
                                <span className="text-gurukul-dark font-medium">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          disabled={busy}
                          onClick={() => selectProxy(lecture.proxyAssignmentId, candidate.teacherId)}
                          className="btn-primary mt-4 w-full"
                        >
                          Select Teacher
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="pt-2 text-sm text-gurukul-ocean">
                  No eligible teacher meets the configured workload and availability constraints.
                </p>
              )
            )}
          </section>
        );
      })}

      {conflicts.length > 0 && (
        <section className="card p-5 border-red-200">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-gurukul-dark">Room conflicts flagged on schedule</h2>
              {conflicts.map((conflict) => (
                <div key={`${conflict.timetableSlotId}-${conflict.type}`} className="mt-3 text-sm text-gurukul-ocean">
                  <p className="font-medium text-gurukul-dark">{conflict.description}</p>
                  {conflict.alternativeRooms.length > 0 && (
                    <p className="text-xs mt-1 text-gurukul-muted">
                      Alternative rooms: {conflict.alternativeRooms.map((room) => room.roomNumber).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {lectures.length > 0 && conflicts.length === 0 && (
        <div className="text-xs text-gurukul-dark flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>No room conflicts detected for the selected day.</span>
        </div>
      )}
    </div>
  );
}
