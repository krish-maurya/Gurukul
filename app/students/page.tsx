"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { GraduationCap, Search, Filter, CheckCircle, FileText, X, Phone, MapPin, HeartPulse, School, User, ArrowRight, ChevronLeft, ChevronRight, Pencil, IndianRupee } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";
import { EditStudentModal, ManageFeesModal, BatchFeesModal } from "@/components/admin/manage-modals";

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
  ADMITTED: "bg-neutral-100 text-neutral-700",
  PENDING: "bg-neutral-100 text-neutral-500",
  REJECTED: "bg-neutral-100 text-neutral-400",
};

const PAGE_SIZE = 10;

function StudentRegistry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selParam = searchParams.get("sel");

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const selectedRowRef = useRef<HTMLTableRowElement | null>(null);

  const { isAdmin } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [showBatchFees, setShowBatchFees] = useState(false);

  const loadStudents = () => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setIsLoading(false));
  };
  useEffect(loadStudents, []);

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
        String(s.rollNumber) === q
      );
    });
  }, [students, searchTerm, selectedGrade]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Deep link from the global search bar: select, jump to the right page, highlight
  useEffect(() => {
    if (selParam && students.length > 0) {
      const target = students.find((s) => s.id === selParam);
      if (target) {
        setSelectedId(target.id);
        setSelectedGrade("ALL");
        setSearchTerm("");
        const idx = students.findIndex((s) => s.id === selParam);
        setPage(Math.floor(idx / PAGE_SIZE) + 1);
      }
    }
  }, [selParam, students]);

  // Scroll the highlighted row into view
  useEffect(() => {
    if (selectedId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId, currentPage]);

  // While typing in the page search, the preview follows the first match
  useEffect(() => {
    if (searchTerm.trim()) {
      setPage(1);
      if (filtered.length > 0) setSelectedId(filtered[0].id);
      else setSelectedId(null);
    }
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGradeChange = (g: string) => {
    setSelectedGrade(g);
    setPage(1);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // keep the URL shareable
    router.replace(`/students?sel=${id}`, { scroll: false });
  };

  const clearSelection = () => {
    setSelectedId(null);
    router.replace("/students", { scroll: false });
  };

  const selected = students.find((s) => s.id === selectedId) || null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gurukul-gray pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-gurukul-dark flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gurukul-dark">Student Registry</h1>
            <p className="text-xs text-gurukul-ocean">
              {isLoading ? "Loading..." : `${filtered.length} of ${students.length} students`}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowBatchFees(true)}
            className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <IndianRupee className="w-4 h-4" />
            <span>Set Class Fees</span>
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gurukul-muted" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, parent, contact or roll number..."
            className="input w-full text-sm pl-9 pr-3 py-2.5 rounded-lg text-gurukul-dark focus:ring-1 focus:ring-gurukul-dark/20 focus:border-gurukul-dark"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gurukul-muted" />
          <select
            value={selectedGrade}
            onChange={(e) => handleGradeChange(e.target.value)}
            className="select text-sm pl-9 pr-8 py-2.5 rounded-lg text-gurukul-dark focus:ring-1 focus:ring-gurukul-dark/20 focus:border-gurukul-dark appearance-none"
          >
            {grades.map((g) => (
              <option key={g} value={g}>{g === "ALL" ? "All Grades" : g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List + Preview Panel */}
      <div className={`grid grid-cols-1 gap-5 items-start ${selected ? "lg:grid-cols-3" : ""}`}>
        {/* Student list */}
        <div className={`card overflow-hidden ${selected ? "lg:col-span-2" : ""}`}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gurukul-gray text-[10px] uppercase tracking-wider text-gurukul-muted">
                <th className="px-4 py-3 font-medium">Roll</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Grade</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Parent</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gurukul-muted">Loading students...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gurukul-muted">No students match your search.</td></tr>
              ) : (
                pageItems.map((s) => (
                  <tr
                    key={s.id}
                    ref={selectedId === s.id ? selectedRowRef : null}
                    onClick={() => handleSelect(s.id)}
                    className={`cursor-pointer transition-colors text-xs ${
                      selectedId === s.id
                        ? "bg-neutral-50 border-l-2 border-l-gurukul-dark"
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-gurukul-ocean">{s.rollNumber}</td>
                    <td className={`px-4 py-3 font-semibold ${selectedId === s.id ? "text-gurukul-dark" : "text-gurukul-dark"}`}>{s.name}</td>
                    <td className="px-4 py-3 text-gurukul-ocean hidden md:table-cell">{s.grade}</td>
                    <td className="px-4 py-3 text-gurukul-ocean hidden md:table-cell">{s.parentName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gurukul-gray">
              <span className="text-[11px] text-gurukul-muted">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gurukul-gray bg-white text-gurukul-ocean disabled:opacity-30 hover:border-gurukul-dark/30 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`gap-${i}`} className="text-[11px] text-gurukul-muted px-1">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`min-w-[28px] text-[11px] font-medium py-1.5 rounded-lg border transition-colors ${
                          p === currentPage
                            ? "bg-gurukul-dark text-white border-gurukul-dark"
                            : "bg-white text-gurukul-ocean border-gurukul-gray hover:border-gurukul-dark/30"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gurukul-gray bg-white text-gurukul-ocean disabled:opacity-30 hover:border-gurukul-dark/30 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview panel — rendered only when someone is selected */}
        {selected && (
          <div className="lg:sticky lg:top-20 animate-slide-up">
            <div className="card overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gurukul-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 text-gurukul-dark font-bold text-sm flex items-center justify-center">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gurukul-dark leading-tight">{selected.name}</h3>
                    <p className="text-[10px] text-gurukul-muted">Roll {selected.rollNumber} · {selected.grade}</p>
                  </div>
                </div>
                <button onClick={clearSelection} className="p-1 rounded-md text-gurukul-muted hover:text-gurukul-dark hover:bg-neutral-100 transition-colors" aria-label="Close preview">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[selected.status]}`}>
                    {selected.status === "ADMITTED" ? (
                      <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />ADMITTED</span>
                    ) : selected.status}
                  </span>
                  <span className="text-gurukul-muted">DOB: {selected.dob}</span>
                </div>

                {[
                  { icon: User, label: "Parent / Guardian", value: selected.parentName },
                  { icon: Phone, label: "Contact", value: selected.contact },
                  { icon: MapPin, label: "Address", value: selected.address || "—" },
                  { icon: HeartPulse, label: "Medical Notes", value: selected.medicalNotes || "—" },
                  { icon: School, label: "Previous School", value: selected.previousSchool || "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-gurukul-muted mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-gurukul-muted uppercase tracking-wide">{label}</p>
                      <p className="text-gurukul-dark font-medium break-words">{value}</p>
                    </div>
                  </div>
                ))}

                {isAdmin && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={() => setShowEdit(true)}
                      className="border border-slate-300 hover:border-gurukul-tech text-slate-700 font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /><span>Edit Details</span>
                    </button>
                    <button onClick={() => setShowFees(true)}
                      className="border border-slate-300 hover:border-gurukul-tech text-slate-700 font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                      <IndianRupee className="w-3.5 h-3.5" /><span>Manage Fees</span>
                    </button>
                  </div>
                )}

                <Link
                  href={`/students/${selected.id}`}
                  className="btn-primary mt-2 w-full font-medium text-xs py-2.5 flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEdit && selected && (
        <EditStudentModal studentId={selected.id} onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); loadStudents(); }} />
      )}
      {showBatchFees && (
        <BatchFeesModal
          grades={grades.filter((g) => g !== "ALL")}
          onClose={() => setShowBatchFees(false)}
          onDone={loadStudents}
        />
      )}
      {showFees && selected && (
        <ManageFeesModal studentId={selected.id} studentName={selected.name}
          onClose={() => setShowFees(false)} onChanged={loadStudents} />
      )}
    </div>
  );
}

export default function StudentRegistryPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gurukul-muted py-10 text-center">Loading...</p>}>
      <StudentRegistry />
    </Suspense>
  );
}
