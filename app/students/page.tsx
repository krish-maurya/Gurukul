"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, Search, Filter, CheckCircle, ShieldAlert, FileText, X, Phone, MapPin, HeartPulse, School, User, ArrowRight } from "lucide-react";

interface StudentRecord {
  id: string;
  rollNumber: number;
  name: string;
  dob: string;
  grade: string;
  parentName: string;
  contact: string;
  address: string | null;
  medicalNotes: string | null;
  previousSchool: string | null;
  status: "ADMITTED" | "PENDING" | "REJECTED";
}

const STATUS_STYLES: Record<StudentRecord["status"], string> = {
  ADMITTED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  PENDING: "bg-amber-100 text-amber-800 border border-amber-200",
  REJECTED: "bg-red-100 text-red-700 border border-red-200",
};

export default function StudentRegistryPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setIsLoading(false));
  }, []);

  const grades = useMemo(
    () => ["ALL", ...Array.from(new Set(students.map((s) => s.grade))).sort()],
    [students]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter((s) => {
      if (selectedGrade !== "ALL" && s.grade !== selectedGrade) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        String(s.rollNumber).includes(q)
      );
    });
  }, [students, searchTerm, selectedGrade]);

  // Auto-select the first match while searching so the preview follows the search
  useEffect(() => {
    if (searchTerm && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [searchTerm, filtered]);

  const selected = students.find((s) => s.id === selectedId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gurukul-gray pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gurukul-dark">Student Registry</h1>
            <p className="text-xs text-slate-500">
              {isLoading ? "Loading..." : `${filtered.length} of ${students.length} students · live from database`}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, parent, contact or roll number..."
            className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-gurukul-tech focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-sm pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-gurukul-tech focus:outline-none appearance-none"
          >
            {grades.map((g) => (
              <option key={g} value={g}>{g === "ALL" ? "All Grades" : g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List + Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Student list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gurukul-gray shadow-subtle overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-gurukul-gray text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-semibold">Roll</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Grade</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Parent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gurukul-gray">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">Loading students...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">No students match your search.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`cursor-pointer transition-colors text-xs ${
                      selectedId === s.id ? "bg-gurukul-tech/5 border-l-2 border-l-gurukul-tech" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-500">{s.rollNumber}</td>
                    <td className="px-4 py-3 font-semibold text-gurukul-dark">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{s.grade}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{s.parentName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right-side preview panel */}
        <div className="lg:sticky lg:top-20">
          {selected ? (
            <div className="bg-white rounded-xl border border-gurukul-gray shadow-card overflow-hidden">
              <div className="bg-gurukul-dark px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gurukul-tech/20 text-gurukul-tech font-bold text-sm flex items-center justify-center">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{selected.name}</h3>
                    <p className="text-[10px] text-slate-400">Roll {selected.rollNumber} · {selected.grade}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="p-1 rounded text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[selected.status]}`}>
                    {selected.status === "ADMITTED" ? <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />ADMITTED</span> : selected.status}
                  </span>
                  <span className="text-slate-400">DOB: {selected.dob}</span>
                </div>

                {[
                  { icon: User, label: "Parent / Guardian", value: selected.parentName },
                  { icon: Phone, label: "Contact", value: selected.contact },
                  { icon: MapPin, label: "Address", value: selected.address || "—" },
                  { icon: HeartPulse, label: "Medical Notes", value: selected.medicalNotes || "—" },
                  { icon: School, label: "Previous School", value: selected.previousSchool || "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                      <p className="text-gurukul-dark font-medium break-words">{value}</p>
                    </div>
                  </div>
                ))}

                <Link
                  href={`/students/${selected.id}`}
                  className="mt-2 w-full bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-medium text-slate-500">Select a student (or search) to preview their record here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
