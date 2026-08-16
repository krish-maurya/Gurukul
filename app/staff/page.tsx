"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Mail, BookOpen, Clock, ShieldCheck, UserPlus, Copy, CheckCircle, X, AlertCircle, Send } from "lucide-react";
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

export default function StaffDirectoryPage() {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  // invite form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadStaff = () => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => setStaff(d.staff || []))
      .catch(() => setStaff([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadStaff, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteUrl("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, department }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteError(data.error || "Failed to create invitation");
      } else {
        setInviteUrl(data.inviteUrl);
        loadStaff();
      }
    } catch {
      setInviteError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const resetInviteModal = () => {
    setShowInvite(false);
    setName("");
    setEmail("");
    setDepartment("");
    setInviteUrl("");
    setInviteError("");
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
            <p className="text-xs text-slate-500">{staff.length} staff members · live from database</p>
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

      {/* Staff Grid */}
      {isLoading ? (
        <p className="text-sm text-slate-500 py-10 text-center">Loading staff...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((member) => {
            const badge = STATUS_BADGE[member.accountStatus];
            return (
              <Link
                key={member.id}
                href={`/staff/${member.id}`}
                className="bg-white rounded-xl border border-gurukul-gray p-5 shadow-subtle hover:border-gurukul-tech/40 hover:shadow-card transition-all block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-gurukul-tech/10 text-gurukul-tech font-bold text-sm flex items-center justify-center">
                    {member.name.charAt(0)}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.label}</span>
                </div>
                <h3 className="text-sm font-semibold text-gurukul-dark">{member.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{member.department}</p>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /><span className="truncate">{member.email}</span></div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-400" /><span>{member.maxPeriodsPerDay}/day · {member.maxPeriodsPerWeek}/week max periods</span></div>
                  {member.subjects.length > 0 && (
                    <div className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-slate-400" /><span className="truncate">{member.subjects.join(", ")}</span></div>
                  )}
                </div>
              </Link>
            );
          })}
          {staff.length === 0 && (
            <p className="text-sm text-slate-400 col-span-full text-center py-10">No staff members yet. Add your first teacher.</p>
          )}
        </div>
      )}

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

            {inviteUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-xs font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Invitation created for {email}. Share this link with the teacher:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={inviteUrl}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 text-[11px] font-mono px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
                  />
                  <button
                    onClick={copyLink}
                    className="shrink-0 bg-gurukul-tech hover:bg-gurukul-tech/90 text-white text-xs font-medium px-3 py-2.5 rounded-lg flex items-center gap-1.5"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  The link is valid for 7 days. The teacher opens it, sets a password, and their account is activated —
                  no email service required.
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
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.smith@gurukul.edu"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Department</label>
                  <input
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Physics & Chemistry"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Creating Invitation..." : "Create Invitation Link"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
