"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Users, Mail, BookOpen, Clock, UserPlus, CheckCircle, X, AlertCircle, Send, Search, FileText, ArrowRight, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: string;
  maxPeriodsPerDay: number;
  maxPeriodsPerWeek: number;
  isActive: boolean;
  subjects: string[];
  accountStatus: "ADMIN" | "ACTIVE" | "INVITED" | "INVITE_EXPIRED" | "NO_ACCOUNT";
}

const STATUS_BADGE: Record<StaffMember["accountStatus"], { label: string; cls: string }> = {
  ADMIN: { label: "Admin", cls: "bg-gurukul-dark text-white" },
  ACTIVE: { label: "Active", cls: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
  INVITED: { label: "Invite Sent", cls: "bg-sky-100 text-sky-800 border border-sky-200" },
  INVITE_EXPIRED: { label: "Invite Expired", cls: "bg-amber-100 text-amber-800 border border-amber-200" },
  NO_ACCOUNT: { label: "No Account", cls: "bg-slate-100 text-slate-600 border border-slate-200" },
};

function StaffDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selParam = searchParams.get("sel");
  const { isAdmin } = useAuth();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  // invite form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailFallbackUrl, setEmailFallbackUrl] = useState("");

  const loadStaff = () => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => setStaff(d.staff || []))
      .catch(() => setStaff([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadStaff, []);

  // Deep link from the global search bar
  useEffect(() => {
    if (selParam && staff.length > 0 && staff.some((s) => s.id === selParam)) {
      setSelectedId(selParam);
      setSearchTerm("");
    }
  }, [selParam, staff]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.subjects.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [staff, searchTerm]);

  // While typing, the preview follows the first match
  useEffect(() => {
    if (searchTerm.trim()) {
      setSelectedId(filtered.length > 0 ? filtered[0].id : null);
    }
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (id: string) => {
    setSelectedId(id);
    router.replace(`/staff?sel=${id}`, { scroll: false });
  };

  const clearSelection = () => {
    setSelectedId(null);
    router.replace("/staff", { scroll: false });
  };

  const selected = staff.find((s) => s.id === selectedId) || null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setEmailSent(false);
    setEmailFallbackUrl("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, department }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setInviteError(data.error || "Failed to create invitation");
      else {
        setEmailSent(data.emailSent);
        if (!data.emailSent) setEmailFallbackUrl(data.inviteUrl);
        loadStaff();
      }
    } catch {
      setInviteError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetInviteModal = () => {
    setShowInvite(false);
    setName(""); setEmail(""); setDepartment("");
    setEmailSent(false); setEmailFallbackUrl(""); setInviteError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gurukul-gray pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gurukul-dark">Staff Directory</h1>
            <p className="text-xs text-slate-500">{isLoading ? "Loading..." : `${filtered.length} of ${staff.length} staff members`}</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(true)}
            className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Teacher</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, department or subject..."
          className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-gurukul-dark focus:border-gurukul-tech focus:outline-none"
        />
      </div>

      {/* Grid + Preview Panel */}
      <div className={`grid grid-cols-1 gap-5 items-start ${selected ? "lg:grid-cols-3" : ""}`}>
        <div className={selected ? "lg:col-span-2" : ""}>
          {isLoading ? (
            <p className="text-sm text-slate-500 py-10 text-center">Loading staff...</p>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${selected ? "" : "xl:grid-cols-3"}`}>
              {filtered.map((member) => {
                const badge = STATUS_BADGE[member.accountStatus];
                const isSel = selectedId === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelect(member.id)}
                    className={`text-left bg-white rounded-xl border p-5 shadow-subtle transition-all ${
                      isSel
                        ? "border-gurukul-tech ring-2 ring-gurukul-tech/20 shadow-card"
                        : "border-gurukul-gray hover:border-gurukul-tech/40 hover:shadow-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center ${
                        isSel ? "bg-gurukul-tech text-white" : "bg-gurukul-tech/10 text-gurukul-tech"
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <h3 className={`text-sm font-semibold ${isSel ? "text-gurukul-tech" : "text-gurukul-dark"}`}>{member.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{member.department}</p>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /><span className="truncate">{member.email}</span></div>
                      {member.subjects.length > 0 && (
                        <div className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-slate-400" /><span className="truncate">{member.subjects.join(", ")}</span></div>
                      )}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-sm text-slate-400 col-span-full text-center py-10">No staff members match your search.</p>
              )}
            </div>
          )}
        </div>

        {/* Preview panel — only when someone is selected */}
        {selected && (
          <div className="lg:sticky lg:top-20">
            <div className="bg-white rounded-xl border border-gurukul-gray shadow-card overflow-hidden">
              <div className="bg-gurukul-dark px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gurukul-tech/20 text-gurukul-tech font-bold text-sm flex items-center justify-center">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{selected.name}</h3>
                    <p className="text-[10px] text-slate-400">{selected.department}</p>
                  </div>
                </div>
                <button onClick={clearSelection} className="p-1 rounded text-slate-400 hover:text-white" aria-label="Close preview">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[selected.accountStatus].cls}`}>
                  {STATUS_BADGE[selected.accountStatus].label}
                </span>

                {[
                  { icon: Mail, label: "Email", value: selected.email },
                  { icon: Building2, label: "Department", value: selected.department },
                  { icon: BookOpen, label: "Subjects", value: selected.subjects.length ? selected.subjects.join(", ") : "—" },
                  { icon: Clock, label: "Workload Limits", value: `${selected.maxPeriodsPerDay} periods/day · ${selected.maxPeriodsPerWeek} periods/week` },
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
                  href={`/staff/${selected.id}`}
                  className="mt-2 w-full bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
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

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-gurukul-tech" />
                <span>Invite a Teacher</span>
              </h2>
              <button onClick={resetInviteModal} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {emailSent || emailFallbackUrl ? (
              <div className="space-y-4">
                {emailSent ? (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-xs font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Invitation email sent to <strong>{email}</strong>. The teacher will receive a link to set up their account.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Invitation created but email delivery failed. Please share this link manually:</span>
                    </div>
                    <input
                      readOnly
                      value={emailFallbackUrl}
                      onFocus={(e) => e.target.select()}
                      className="w-full text-[11px] font-mono px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
                    />
                  </>
                )}
                <p className="text-[11px] text-slate-400">
                  The invitation link is valid for 7 days. The teacher opens it, sets a password, and their account is ready.
                </p>
                <button
                  onClick={resetInviteModal}
                  className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium py-2.5 rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                {inviteError && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email Address</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane.smith@gurukul.edu"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Department</label>
                  <input required value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Physics & Chemistry"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending Invitation..." : "Send Invitation"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffDirectoryPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400 py-10 text-center">Loading...</p>}>
      <StaffDirectory />
    </Suspense>
  );
}
