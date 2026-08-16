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
    <div className="card overflow-hidden animate-fade-in">
      {/* Grid Header & View Mode Switcher */}
      <div className="p-4 border-b border-gurukul-gray bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gurukul-muted" />
          <div>
            <h3 className="text-sm font-semibold text-gurukul-dark">
              {viewMode === "day" ? `Daily Schedule · ${formattedTitle}` : "Full Weekly Schedule Matrix"}
            </h3>
            <p className="text-[11px] text-gurukul-ocean">
              {viewMode === "day"
                ? `Showing periods for ${activeDay} (${activeDate})`
                : "Showing all 5 days of the instructional week"}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-neutral-100 p-0.5 rounded-lg flex items-center gap-1">
            <button
              onClick={() => setViewMode("day")}
              className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "day"
                  ? "bg-white text-gurukul-dark shadow-subtle"
                  : "text-gurukul-ocean hover:text-gurukul-dark"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "week"
                  ? "bg-white text-gurukul-dark shadow-subtle"
                  : "text-gurukul-ocean hover:text-gurukul-dark"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Week View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="px-4 py-2 bg-neutral-50/50 border-b border-gurukul-gray flex flex-wrap items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-white border border-neutral-200/80" />
          <span className="text-gurukul-ocean">Standard Lecture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-50 border border-amber-200" />
          <span className="text-gurukul-ocean">Proxy Covered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-50 border border-red-200" />
          <span className="text-gurukul-ocean">Clash Detected</span>
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
              <tr className="bg-neutral-50 border-b border-gurukul-gray">
                <th className="p-3.5 w-36 text-[11px] font-medium text-gurukul-muted uppercase tracking-wider border-r border-gurukul-gray">
                  Period / Time
                </th>
                {grades.map((grade) => (
                  <th
                    key={grade}
                    className="p-3.5 text-xs font-semibold text-gurukul-dark uppercase tracking-wider border-r border-gurukul-gray last:border-r-0"
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
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Period Label */}
                    <td className="p-3.5 border-r border-gurukul-gray bg-neutral-50 align-top">
                      <p className="text-xs font-semibold text-gurukul-dark">Period {p.id}</p>
                      <p className="text-[10px] text-gurukul-muted font-mono mt-0.5">{p.time}</p>
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
                                ? "bg-red-50 ring-1 ring-red-200"
                                : "bg-red-50/50"
                              : "hover:bg-neutral-50/30"
                          }`}
                        >
                          {slot ? (
                            <div
                              onClick={() => conflictForPeriod && onSelectConflict(conflictForPeriod)}
                              className={`p-3 rounded-lg border text-xs transition-all ${
                                isAffectedByConflict
                                  ? "bg-white border-red-200 shadow-subtle cursor-pointer hover:border-red-300"
                                  : slot.isProxy
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-white border-neutral-200/80 hover:border-neutral-300"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-sm text-gurukul-dark">{slot.subjectName}</span>
                                {slot.requiresLab && (
                                  <span className="badge-default">Lab</span>
                                )}
                              </div>

                              <div className="space-y-1 text-[11px] text-gurukul-ocean">
                                <p className="flex items-center gap-1.5 font-medium truncate">
                                  <User className={`w-3.5 h-3.5 flex-shrink-0 ${slot.isProxy ? "text-amber-600" : "text-gurukul-muted"}`} />
                                  <span className="truncate">{slot.teacherName}</span>
                                  {slot.isProxy && (
                                    <span className="badge-warning ml-auto shrink-0">Proxy</span>
                                  )}
                                  {slot.proxyStatus === "PENDING" && (
                                    <span className="badge-error ml-auto shrink-0">Absent</span>
                                  )}
                                </p>
                                <p className="flex items-center gap-1.5 text-gurukul-muted truncate">
                                  <MapPin className="w-3.5 h-3.5 text-gurukul-muted flex-shrink-0" />
                                  <span className="truncate font-mono">{slot.roomName}</span>
                                  <span className="text-[10px] text-gurukul-muted">({slot.roomType})</span>
                                </p>
                              </div>

                              {isAffectedByConflict && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectConflict(conflictForPeriod);
                                  }}
                                  className="mt-2 w-full text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md flex items-center justify-center gap-1 border border-red-200 transition-colors"
                                >
                                  <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                  <span>Resolve {conflictForPeriod.type.replace("_", " ")}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center text-xs text-gurukul-muted font-mono bg-neutral-50 rounded-lg">
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
              <tr className="bg-neutral-50 border-b border-gurukul-gray">
                <th className="p-3 w-32 text-[11px] font-medium text-gurukul-muted uppercase tracking-wider border-r border-gurukul-gray">
                  Period / Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`p-3 text-[11px] font-medium uppercase tracking-wider border-r border-gurukul-gray last:border-r-0 text-center ${
                      day === activeDay ? "bg-gurukul-dark text-white font-semibold" : "text-gurukul-dark"
                    }`}
                  >
                    {day} {day === activeDay && "·"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gurukul-gray">
              {PERIODS.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                  {/* Time Label */}
                  <td className="p-3 border-r border-gurukul-gray bg-neutral-50">
                    <p className="text-xs font-semibold text-gurukul-dark">Period {p.id}</p>
                    <p className="text-[10px] text-gurukul-muted font-mono mt-0.5">{p.time}</p>
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
                              ? "bg-red-50 ring-1 ring-red-200"
                              : "bg-red-50/50 hover:bg-red-50"
                            : isCurrentActiveDay
                              ? "bg-neutral-50/80 hover:bg-neutral-100/50"
                              : "hover:bg-neutral-50/30"
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
                                    ? "bg-white border-red-200 cursor-pointer hover:border-red-300"
                                    : slot.isProxy
                                      ? "bg-amber-50 border-amber-200 hover:border-amber-300"
                                      : "bg-white border-neutral-200/80 hover:border-neutral-300"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-gurukul-dark">{slot.grade}</span>
                                  <span className="badge-default">
                                    {slot.subjectName.split(" ")[0]}
                                  </span>
                                </div>

                                <div className="space-y-0.5 text-[10px] text-gurukul-ocean">
                                  <p className="flex items-center gap-1 font-medium truncate">
                                    <User className={`w-3 h-3 flex-shrink-0 ${slot.isProxy ? "text-amber-600" : "text-gurukul-muted"}`} />
                                    <span className="truncate">{slot.teacherName}</span>
                                    {slot.isProxy && (
                                      <span className="badge-warning ml-auto shrink-0 !text-[8px] !px-1 !py-0">Proxy</span>
                                    )}
                                    {slot.proxyStatus === "PENDING" && (
                                      <span className="badge-error ml-auto shrink-0 !text-[8px] !px-1 !py-0">Absent</span>
                                    )}
                                  </p>
                                  <p className="flex items-center gap-1 text-gurukul-muted truncate">
                                    <MapPin className="w-3 h-3 text-gurukul-muted flex-shrink-0" />
                                    <span className="truncate">{slot.roomName}</span>
                                  </p>
                                </div>
                              </div>
                            ))}

                            {conflict && (
                              <button
                                onClick={() => onSelectConflict(conflict)}
                                className="w-full text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md flex items-center justify-center gap-1 border border-red-200 transition-colors"
                              >
                                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                <span className="truncate">{conflict.type.replace("_", " ")}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-[10px] text-gurukul-muted font-mono bg-neutral-50 rounded-lg">
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