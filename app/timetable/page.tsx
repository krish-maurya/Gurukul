"use client";

import React, { useState, useEffect } from "react";
import { TimetableGrid } from "@/components/timetable/grid";
import { ConflictPanel } from "@/components/timetable/conflict-panel";
import {
  evaluateTimetable,
  resolveConflictInSchedule,
  TimetableSlotInput,
  TimetableConflictDetail,
} from "@/lib/timetable/optimizer";
import { Calendar, RefreshCw, CheckCircle, AlertCircle, Play, Sparkles } from "lucide-react";

// Synthetic Dataset with Intentional Conflicts for Hackathon Demo
const INITIAL_DEMO_SLOTS: TimetableSlotInput[] = [
  // Intentional Conflict 1: Prof. Alan Turing double-booked Mon Period 1
  {
    id: "slot-1",
    day: "Mon",
    period: 1,
    grade: "Grade 10A",
    subjectId: "subj-math",
    subjectName: "Advanced Mathematics",
    teacherId: "staff-turing",
    teacherName: "Prof. Alan Turing",
    roomId: "room-101",
    roomName: "Room 101",
  },
  {
    id: "slot-2",
    day: "Mon",
    period: 1,
    grade: "Grade 11B",
    subjectId: "subj-cs",
    subjectName: "Algorithms & Logic",
    teacherId: "staff-turing", // Double booked!
    teacherName: "Prof. Alan Turing",
    roomId: "room-102",
    roomName: "Room 102",
  },

  // Intentional Conflict 2: Room 101 double-booked Mon Period 2
  {
    id: "slot-3",
    day: "Mon",
    period: 2,
    grade: "Grade 10A",
    subjectId: "subj-phys",
    subjectName: "Quantum Physics",
    teacherId: "staff-curie",
    teacherName: "Dr. Marie Curie",
    roomId: "room-101",
    roomName: "Room 101",
  },
  {
    id: "slot-4",
    day: "Mon",
    period: 2,
    grade: "Grade 12A",
    subjectId: "subj-chem",
    subjectName: "Organic Chemistry",
    teacherId: "staff-feynman",
    teacherName: "Prof. Richard Feynman",
    roomId: "room-101", // Room double booked!
    roomName: "Room 101",
  },

  // Valid slots
  {
    id: "slot-5",
    day: "Tue",
    period: 1,
    grade: "Grade 10A",
    subjectId: "subj-cs",
    subjectName: "Algorithms & Logic",
    teacherId: "staff-turing",
    teacherName: "Prof. Alan Turing",
    roomId: "room-laba",
    roomName: "Science Lab A",
  },
  {
    id: "slot-6",
    day: "Wed",
    period: 3,
    grade: "Grade 11B",
    subjectId: "subj-math",
    subjectName: "Advanced Mathematics",
    teacherId: "staff-newton",
    teacherName: "Sir Isaac Newton",
    roomId: "room-201",
    roomName: "Room 201",
  },
  {
    id: "slot-7",
    day: "Thu",
    period: 4,
    grade: "Grade 12A",
    subjectId: "subj-phys",
    subjectName: "Quantum Physics",
    teacherId: "staff-feynman",
    teacherName: "Prof. Richard Feynman",
    roomId: "room-102",
    roomName: "Room 102",
  },
  {
    id: "slot-8",
    day: "Fri",
    period: 2,
    grade: "Grade 10A",
    subjectId: "subj-chem",
    subjectName: "Organic Chemistry",
    teacherId: "staff-curie",
    teacherName: "Dr. Marie Curie",
    roomId: "room-laba",
    roomName: "Science Lab A",
  },
];

export default function TimetableOptimizerPage() {
  const [slots, setSlots] = useState<TimetableSlotInput[]>(INITIAL_DEMO_SLOTS);
  const [conflicts, setConflicts] = useState<TimetableConflictDetail[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<TimetableConflictDetail | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  // Evaluate timetable when slots update
  useEffect(() => {
    const evalResult = evaluateTimetable(slots);
    setConflicts(evalResult.conflicts);
    if (evalResult.conflicts.length > 0 && !selectedConflict) {
      setSelectedConflict(evalResult.conflicts[0]);
    }
  }, [slots]);

  const handleApplyFix = (conflict: TimetableConflictDetail) => {
    const updatedSlots = resolveConflictInSchedule(slots, conflict);
    setSlots(updatedSlots);
    setSelectedConflict(null);
  };

  const handleRunFullOptimization = () => {
    let resolved = [...slots];
    const evalResult = evaluateTimetable(resolved);
    evalResult.conflicts.forEach((c) => {
      resolved = resolveConflictInSchedule(resolved, c);
    });
    setSlots(resolved);
    setSelectedConflict(null);
  };

  const handleResetDataset = () => {
    setSlots(INITIAL_DEMO_SLOTS);
    setIsApproved(false);
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gurukul-gray pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">
              Timetable Optimization Engine
            </h1>
            <span className="text-[10px] bg-gurukul-tech text-white font-bold px-2 py-0.5 rounded uppercase">
              Constraint Algorithm
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Constraint-based scheduling algorithm detecting teacher double-booking, room capacity clashes, and workload distribution.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDataset}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2 rounded-lg transition-colors border border-gurukul-gray flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Clashing Dataset</span>
          </button>
          <button
            onClick={handleRunFullOptimization}
            disabled={conflicts.length === 0}
            className="text-xs bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-50 text-white font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Solve All Clashes</span>
          </button>
        </div>
      </div>

      {isApproved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Master Timetable has been officially validated, approved, and saved to database!</span>
          </div>
          <button
            onClick={() => setIsApproved(false)}
            className="text-[11px] underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Matrix Grid (8 columns) */}
        <div className="lg:col-span-8">
          <TimetableGrid
            slots={slots}
            conflicts={conflicts}
            selectedConflict={selectedConflict}
            onSelectConflict={setSelectedConflict}
          />
        </div>

        {/* AI Inspector Side Panel (4 columns) */}
        <div className="lg:col-span-4 min-h-[520px]">
          <ConflictPanel
            conflicts={conflicts}
            selectedConflict={selectedConflict}
            onSelectConflict={setSelectedConflict}
            onApplyFix={handleApplyFix}
            onApproveTimetable={() => setIsApproved(true)}
          />
        </div>
      </div>
    </div>
  );
}
