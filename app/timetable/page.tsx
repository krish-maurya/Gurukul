"use client";

import { useState } from "react";
import { ProxyCoverage } from "@/components/timetable/proxy-coverage";
import { MasterTimetable } from "@/components/timetable/master-timetable";
import { AddSlotModal } from "@/components/timetable/add-slot-modal";
import { useAuth } from "@/lib/auth/session-context";
import { Calendar, CalendarPlus } from "lucide-react";

export default function TimetablePage() {
  const { currentUser } = useAuth();
  // Admin role check: if role is TEACHER, user sees read-only approved timetable
  const isAdmin = currentUser ? currentUser.role === "ADMIN" : true;

  const [activeDate, setActiveDate] = useState("2026-08-17");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddSlot, setShowAddSlot] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gurukul-gray pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">
              {isAdmin ? "Timetable Operations & Dispatch" : "School Timetable"}
            </h1>
            <span className="text-[10px] bg-gurukul-tech text-white font-bold px-2 py-0.5 rounded uppercase">
              {isAdmin ? "Admin Console" : "Teacher View"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? "Absence coverage and room clashes are date-isolated. Absences marked for one day do not affect other dates."
              : "Teachers can view the official approved schedule. Coverage and room modifications are managed by school administrators."}
          </p>
        </div>

        {/* Add Slot + Clean Date Picker */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddSlot(true)}
            className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{isAdmin ? "Add Slot" : "Add My Lecture"}</span>
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-gurukul-tech" />
            <span className="text-xs font-medium text-slate-600">Schedule Date:</span>
            <input
              type="date"
              aria-label="Select Date"
              value={activeDate}
              onChange={(e) => e.target.value && setActiveDate(e.target.value)}
              className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>

      {showAddSlot && (
        <AddSlotModal onClose={() => setShowAddSlot(false)} onCreated={handleRefresh} />
      )}

      <MasterTimetable
        date={activeDate}
        refreshTrigger={refreshTrigger}
        onTimetableUpdated={handleRefresh}
        isAdminOverride={isAdmin}
      />

      {isAdmin && (
        <ProxyCoverage
          date={activeDate}
          onDateChange={setActiveDate}
          onProxyAssigned={handleRefresh}
        />
      )}
    </div>
  );
}
