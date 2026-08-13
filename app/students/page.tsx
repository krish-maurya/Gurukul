"use client";

import React, { useState } from "react";
import { GraduationCap, Search, Filter, Plus, CheckCircle, ShieldAlert, FileText } from "lucide-react";
import Link from "next/link";

interface StudentRecord {
  id: string;
  name: string;
  dob: string;
  grade: string;
  parentName: string;
  contact: string;
  address: string;
  medicalNotes: string;
  status: "ADMITTED" | "PENDING" | "REJECTED";
}

const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: "std-101",
    name: "Liam Sterling",
    dob: "2009-04-12",
    grade: "Grade 10A",
    parentName: "Robert Sterling",
    contact: "+1 (555) 234-5678",
    address: "742 Evergreen Terrace, Springfield",
    medicalNotes: "Asthma - Keep inhaler on file",
    status: "ADMITTED",
  },
  {
    id: "std-102",
    name: "Sophia Chen",
    dob: "2009-09-28",
    grade: "Grade 10A",
    parentName: "David Chen",
    contact: "+1 (555) 876-5432",
    address: "128 Oakridge Lane, Metro City",
    medicalNotes: "No known allergies",
    status: "ADMITTED",
  },
  {
    id: "std-103",
    name: "Aarav Sharma",
    dob: "2008-11-05",
    grade: "Grade 11B",
    parentName: "Priya Sharma",
    contact: "+1 (555) 345-6789",
    address: "45 Lotus Parkway, Techville",
    medicalNotes: "Peanut allergy",
    status: "PENDING",
  },
];

export default function StudentRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("ALL");

  const filteredStudents = SAMPLE_STUDENTS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === "ALL" || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gurukul-gray pb-5">
        <div>
          <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">Student Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized student database indexed automatically from approved Document Intelligence admissions.
          </p>
        </div>

        <Link
          href="/documents"
          className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start"
        >
          <FileText className="w-4 h-4" />
          <span>Ingest New Admission Form</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gurukul-gray p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by student name, grade, or guardian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gurukul-gray rounded-lg pl-9 pr-4 py-2 text-xs text-gurukul-dark focus:outline-none focus:border-gurukul-tech"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-slate-50 border border-gurukul-gray text-xs text-gurukul-dark rounded-lg px-3 py-2 focus:outline-none focus:border-gurukul-tech"
          >
            <option value="ALL">All Grade Levels</option>
            <option value="Grade 10A">Grade 10A</option>
            <option value="Grade 11B">Grade 11B</option>
            <option value="Grade 12A">Grade 12A</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-gurukul-gray text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Date of Birth</th>
                <th className="px-6 py-3">Guardian</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Medical Notes</th>
                <th className="px-6 py-3 text-right">Admission Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gurukul-gray">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gurukul-dark flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center font-bold text-xs">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span>{s.name}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{s.grade}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{s.dob}</td>
                  <td className="px-6 py-4 text-slate-800">{s.parentName}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{s.contact}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{s.medicalNotes}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                        s.status === "ADMITTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
