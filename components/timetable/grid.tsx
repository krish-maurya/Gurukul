"use client";

import React, { useState } from "react";
import { TimetableSlotInput, TimetableConflictDetail } from "@/lib/timetable/optimizer";
import { Calendar, AlertTriangle, User, MapPin, LayoutGrid, CalendarRange } from "lucide-react";

interface TimetableGridProps {
  slots: TimetableSlotInput[];
  conflicts: TimetableConflictDetail[];
  selectedConflict: TimetableConflictDetail | null;
  onSelectConflict: (conflict: TimetableConflictDetail) => void;
  activeDate?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = [
  { id: 1, time: "09:00 - 09:50 AM" },
  { id: 2, time: "10:00 - 10:50 AM" },
  { id: 3, time: "11:00 - 11:50 AM" },
  { id: 4, time: "12:00 - 12:50 PM" },
  { id: 5, time: "02:00 - 02:50 PM" },
  { id: 6, time: "03:00 - 03:50 PM" },
];

function getDayFromDate(dateStr?: string): string {
  if (!dateStr) return "Mon";
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    const shortDay = d.toLocaleDateString("en-US", { weekday: "short" });
    return ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(shortDay) ? shortDay : "Mon";
  } catch {
    return "Mon";
  }
}

function getFormattedDateTitle(dateStr?: string): string {
  if (!dateStr) return "Monday, August 17, 2026";
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function TimetableGrid({
  slots,
  conflicts,
  selectedConflict,
  onSelectConflict,
  activeDate = "2026-08-17",
}: TimetableGridProps) {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const activeDay = getDayFromDate(activeDate);
  const formattedTitle = getFormattedDateTitle(activeDate);

  // Extract unique grades for day view
  const availableGrades = Array.from(new Set(slots.map((s) => s.grade))).sort();
  const grades = availableGrades.length > 0 ? availableGrades : ["Grade 10A", "Grade 11A"];

  // Filter slots for the active day in day view
  const daySlots = slots.filter((s) => s.day === activeDay);
  const dayConflicts = conflicts.filter((c) => c.day === activeDay);

  // Check if a specific slot has any conflict
  const getSlotConflict = (day: string, period: number): TimetableConflictDetail | undefined => {
    return conflicts.find((c) => c.day === day && c.period === period);
  };

  return (
    <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle overflow-hidden">
      {/* Grid Header & View Mode Switcher */}
      <div className="p-4 border-b border-gurukul-gray bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gurukul-tech" />
          <div>
            <h3 className="text-sm font-semibold text-gurukul-dark">
              {viewMode === "day" ? `Daily Schedule · ${formattedTitle}` : "Full Weekly Schedule Matrix"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {viewMode === "day"
                ? `Showing periods for ${activeDay} (${activeDate})`
                : "Showing all 5 days of the instructional week"}
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Legend */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center gap-1">
            <button
              onClick={() => setViewMode("day")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "day"
                  ? "bg-white text-gurukul-dark shadow-xs"
                  : "text-slate-600 hover:text-gurukul-dark"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "week"
                  ? "bg-white text-gurukul-dark shadow-xs"
                  : "text-slate-600 hover:text-gurukul-dark"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Week View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-200/60 flex flex-wrap items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-gurukul-tech/20 border border-gurukul-tech/40" />
          <span className="text-slate-600">Standard Lecture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300" />
          <span className="text-amber-800 font-medium">Proxy Covered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-300" />
          <span className="text-rose-700 font-medium">Clash Detected</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="overflow-x-auto">
        {viewMode === "day" ? (
          /* ========================================================= */
          /* SINGLE DAY VIEW: Clean, spacious schedule for activeDate */
          /* ========================================================= */
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gurukul-gray">
                <th className="p-3.5 w-36 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-r border-gurukul-gray">
                  Period / Time
                </th>
                {grades.map((grade) => (
                  <th
                    key={grade}
                    className="p-3.5 text-xs font-bold text-gurukul-dark uppercase tracking-wider border-r border-gurukul-gray last:border-r-0"
                  >
                    {grade}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gurukul-gray">
              {PERIODS.map((p) => {
                const conflictForPeriod = dayConflicts.find((c) => c.period === p.id);
                const isConflictSelected = selectedConflict?.id === conflictForPeriod?.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Period Label */}
                    <td className="p-3.5 border-r border-gurukul-gray bg-slate-50/70 align-top">
                      <p className="text-xs font-bold text-gurukul-dark">Period {p.id}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.time}</p>
                    </td>

                    {/* Class Slots for this Period */}
                    {grades.map((grade) => {
                      const slot = daySlots.find((s) => s.grade === grade && s.period === p.id);
                      const isAffectedByConflict = conflictForPeriod && conflictForPeriod.affectedSlotIds?.includes(slot?.id || "");

                      return (
                        <td
                          key={`${grade}-${p.id}`}
                          className={`p-3 border-r border-gurukul-gray last:border-r-0 align-top transition-all ${
                            isAffectedByConflict
                              ? isConflictSelected
                                ? "bg-rose-100/80 ring-2 ring-rose-500"
                                : "bg-rose-50/70"
                              : "hover:bg-slate-100/30"
                          }`}
                        >
                          {slot ? (
                            <div
                              onClick={() => conflictForPeriod && onSelectConflict(conflictForPeriod)}
                              className={`p-3 rounded-lg border text-xs transition-all ${
                                isAffectedByConflict
                                  ? "bg-white border-rose-300 shadow-sm cursor-pointer hover:border-rose-500 ring-1 ring-rose-200"
                                  : slot.isProxy
                                    ? "bg-amber-50/70 border-amber-300 shadow-xs"
                                    : "bg-white border-slate-200 hover:border-gurukul-tech/40"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-sm text-gurukul-dark">{slot.subjectName}</span>
                                {slot.requiresLab && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    Lab
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-600">
                                <p className="flex items-center gap-1.5 font-medium truncate">
                                  <User className={`w-3.5 h-3.5 flex-shrink-0 ${slot.isProxy ? "text-amber-600" : "text-gurukul-tech"}`} />
                                  <span className="truncate">{slot.teacherName}</span>
                                  {slot.isProxy && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300 ml-auto shrink-0">
                                      Proxy
                                    </span>
                                  )}
                                  {slot.proxyStatus === "PENDING" && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-700 border border-rose-300 ml-auto shrink-0">
                                      Absent
                                    </span>
                                  )}
                                </p>
                                <p className="flex items-center gap-1.5 text-slate-500 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-gurukul-ocean flex-shrink-0" />
                                  <span className="truncate font-mono">{slot.roomName}</span>
                                  <span className="text-[10px] text-slate-400">({slot.roomType})</span>
                                </p>
                              </div>

                              {isAffectedByConflict && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectConflict(conflictForPeriod);
                                  }}
                                  className="mt-2 w-full text-[10px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2 py-1 rounded flex items-center justify-center gap-1 border border-rose-300 transition-colors"
                                >
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                  <span>Resolve {conflictForPeriod.type.replace("_", " ")}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center text-xs text-slate-300 font-mono">
                              Free Slot
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* ========================================================= */
          /* FULL WEEK VIEW: 5-Day Matrix (Mon - Fri)                  */
          /* ========================================================= */
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gurukul-gray">
                <th className="p-3 w-32 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-r border-gurukul-gray">
                  Period / Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`p-3 text-[11px] font-semibold uppercase tracking-wider border-r border-gurukul-gray last:border-r-0 text-center ${
                      day === activeDay ? "bg-gurukul-tech/10 text-gurukul-tech font-bold" : "text-gurukul-dark"
                    }`}
                  >
                    {day} {day === activeDay && "•"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gurukul-gray">
              {PERIODS.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Time Label */}
                  <td className="p-3 border-r border-gurukul-gray bg-slate-50/70">
                    <p className="text-xs font-bold text-gurukul-dark">Period {p.id}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.time}</p>
                  </td>

                  {/* Day Columns */}
                  {DAYS.map((day) => {
                    const matchingSlots = slots.filter((s) => s.day === day && s.period === p.id);
                    const conflict = getSlotConflict(day, p.id);
                    const isConflictSelected = selectedConflict?.id === conflict?.id;
                    const isCurrentActiveDay = day === activeDay;

                    return (
                      <td
                        key={`${day}-${p.id}`}
                        className={`p-2 border-r border-gurukul-gray last:border-r-0 align-top transition-all ${
                          conflict
                            ? isConflictSelected
                              ? "bg-rose-100/80 ring-2 ring-rose-500"
                              : "bg-rose-50/60 hover:bg-rose-100/60"
                            : isCurrentActiveDay
                              ? "bg-slate-50/80 hover:bg-slate-100/50"
                              : "hover:bg-slate-100/40"
                        }`}
                      >
                        {matchingSlots.length > 0 ? (
                          <div className="space-y-1.5">
                            {matchingSlots.map((slot) => (
                              <div
                                key={slot.id}
                                onClick={() => conflict && onSelectConflict(conflict)}
                                className={`p-2 rounded-lg border text-xs transition-all ${
                                  conflict
                                    ? "bg-white border-rose-300 shadow-xs cursor-pointer hover:border-rose-500"
                                    : slot.isProxy
                                      ? "bg-amber-50/50 border-amber-300 hover:border-amber-500 shadow-xs"
                                      : "bg-white border-slate-200 hover:border-gurukul-tech/40"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-gurukul-dark">{slot.grade}</span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-gurukul-tech/10 text-gurukul-tech">
                                    {slot.subjectName.split(" ")[0]}
                                  </span>
                                </div>

                                <div className="space-y-0.5 text-[10px] text-slate-600">
                                  <p className="flex items-center gap-1 font-medium truncate">
                                    <User className={`w-3 h-3 flex-shrink-0 ${slot.isProxy ? "text-amber-600" : "text-gurukul-tech"}`} />
                                    <span className="truncate">{slot.teacherName}</span>
                                    {slot.isProxy && (
                                      <span className="text-[8px] px-1 py-0.2 rounded font-bold bg-amber-200/80 text-amber-800 border border-amber-300 ml-auto shrink-0">
                                        Proxy
                                      </span>
                                    )}
                                    {slot.proxyStatus === "PENDING" && (
                                      <span className="text-[8px] px-1 py-0.2 rounded font-bold bg-rose-100 text-rose-700 border border-rose-300 ml-auto shrink-0">
                                        Absent
                                      </span>
                                    )}
                                  </p>
                                  <p className="flex items-center gap-1 text-slate-500 truncate">
                                    <MapPin className="w-3 h-3 text-gurukul-ocean flex-shrink-0" />
                                    <span className="truncate">{slot.roomName}</span>
                                  </p>
                                </div>
                              </div>
                            ))}

                            {conflict && (
                              <button
                                onClick={() => onSelectConflict(conflict)}
                                className="w-full text-[10px] font-bold text-rose-700 bg-rose-200/60 hover:bg-rose-200 px-2 py-1 rounded flex items-center justify-center gap-1 border border-rose-300 transition-colors"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span className="truncate">{conflict.type.replace("_", " ")}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-[10px] text-slate-300 font-mono">
                            Free Slot
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
