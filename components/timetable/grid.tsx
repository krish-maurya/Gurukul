"use client";

import React from "react";
import { TimetableSlotInput, TimetableConflictDetail } from "@/lib/timetable/optimizer";
import { Calendar, AlertTriangle, User, MapPin, BookOpen } from "lucide-react";

interface TimetableGridProps {
  slots: TimetableSlotInput[];
  conflicts: TimetableConflictDetail[];
  selectedConflict: TimetableConflictDetail | null;
  onSelectConflict: (conflict: TimetableConflictDetail) => void;
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

export function TimetableGrid({
  slots,
  conflicts,
  selectedConflict,
  onSelectConflict,
}: TimetableGridProps) {
  // Check if a specific slot has any conflict
  const getSlotConflict = (day: string, period: number): TimetableConflictDetail | undefined => {
    return conflicts.find((c) => c.day === day && c.period === period);
  };

  return (
    <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle overflow-hidden">
      {/* Grid Header */}
      <div className="p-4 border-b border-gurukul-gray bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gurukul-tech" />
          <h3 className="text-sm font-semibold text-gurukul-dark">Master School Schedule Matrix</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gurukul-tech/10 border border-gurukul-tech/30" />
            <span className="text-slate-600">Standard Scheduled Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 animate-pulse" />
            <span className="text-rose-700 font-medium">Clash Flagged</span>
          </div>
        </div>
      </div>

      {/* Grid Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-slate-100/70 border-b border-gurukul-gray">
              <th className="p-3 w-32 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-r border-gurukul-gray">
                Period / Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="p-3 text-[11px] font-semibold text-gurukul-dark text-center uppercase tracking-wider border-r border-gurukul-gray last:border-r-0"
                >
                  {day}
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

                  return (
                    <td
                      key={`${day}-${p.id}`}
                      className={`p-2 border-r border-gurukul-gray last:border-r-0 align-top transition-all ${
                        conflict
                          ? isConflictSelected
                            ? "bg-rose-100/80 ring-2 ring-rose-500"
                            : "bg-rose-50/60 hover:bg-rose-100/60"
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
                                  <User className="w-3 h-3 text-gurukul-tech flex-shrink-0" />
                                  <span className="truncate">{slot.teacherName}</span>
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
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>{conflict.type.replace("_", " ")}</span>
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
      </div>
    </div>
  );
}
