"use client";

import React from "react";
import { Users, Mail, BookOpen, Clock, ShieldCheck } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: string;
  maxPeriods: number;
  assignedSubjects: string[];
  role: "ADMIN" | "STAFF";
}

const SAMPLE_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Dr. Eleanor Vance",
    email: "principal@gurukul.edu",
    department: "Executive Administration",
    maxPeriods: 2,
    assignedSubjects: ["Educational Leadership"],
    role: "ADMIN",
  },
  {
    id: "staff-2",
    name: "Prof. Alan Turing",
    email: "turing@gurukul.edu",
    department: "Computer Science & Mathematics",
    maxPeriods: 4,
    assignedSubjects: ["Advanced Mathematics", "Algorithms & Logic"],
    role: "STAFF",
  },
  {
    id: "staff-3",
    name: "Dr. Marie Curie",
    email: "curie@gurukul.edu",
    department: "Physics & Chemistry",
    maxPeriods: 4,
    assignedSubjects: ["Quantum Physics", "Organic Chemistry"],
    role: "STAFF",
  },
  {
    id: "staff-4",
    name: "Sir Isaac Newton",
    email: "newton@gurukul.edu",
    department: "Mathematics",
    maxPeriods: 3,
    assignedSubjects: ["Calculus II", "Classical Mechanics"],
    role: "STAFF",
  },
];

export default function StaffDirectoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gurukul-gray pb-5">
        <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">Faculty & Staff Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Academic personnel registry with daily period workload limits enforced by the Timetable Optimizer.
        </p>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SAMPLE_STAFF.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-xl border border-gurukul-gray p-5 shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gurukul-dark text-white flex items-center justify-center font-bold text-sm">
                    {staff.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gurukul-dark">{staff.name}</h3>
                    <p className="text-xs text-gurukul-ocean font-medium">{staff.department}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    staff.role === "ADMIN"
                      ? "bg-gurukul-tech text-white"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {staff.role} Access
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gurukul-tech" />
                  <span>Max Workload: <strong className="text-gurukul-dark">{staff.maxPeriods} Periods/Day</strong></span>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <BookOpen className="w-3.5 h-3.5 text-gurukul-ocean flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {staff.assignedSubjects.map((subj) => (
                      <span
                        key={subj}
                        className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
