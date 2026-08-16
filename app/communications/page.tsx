"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MessagesSquare, Send, Trash2, PenSquare, RefreshCw, Search, X, AlertCircle, CheckCircle, Link2, Copy, Mail, Sparkles, UserX, IndianRupee, Megaphone } from "lucide-react";

interface MessageRow {
  id: string;
  type: "ABSENCE" | "FEE" | "ANNOUNCEMENT" | "CUSTOM";
  title: string;
  body: string;
  status: "DRAFT" | "SENT" | "ACKNOWLEDGED";
  sentByName: string | null;
  sentAt: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
  student: { id: string; name: string; grade: string; rollNumber: number; parentName: string; parentEmail: string | null; portalToken: string | null };
}

interface StudentLite { id: string; name: string; grade: string; rollNumber: number; }

const TYPE_META: Record<MessageRow["type"], { icon: React.ElementType; cls: string; label: string }> = {
  ABSENCE: { icon: UserX, cls: "bg-amber-100 text-amber-700", label: "Absence" },
  FEE: { icon: IndianRupee, cls: "bg-rose-100 text-rose-700", label: "Fees" },
  ANNOUNCEMENT: { icon: Megaphone, cls: "bg-sky-100 text-sky-700", label: "Notice" },
  CUSTOM: { icon: MessagesSquare, cls: "bg-violet-100 text-violet-700", label: "Message" },
};

const STATUS_CLS: Record<MessageRow["status"], string> = {
  DRAFT: "bg-slate-100 text-slate-600 border border-slate-200",
  SENT: "bg-sky-100 text-sky-800 border border-sky-200",
  ACKNOWLEDGED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

export default function ParentConnectPage() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"DRAFT" | "SENT" | "ACKNOWLEDGED" | "ALL">("DRAFT");
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [linkModal, setLinkModal] = useState<MessageRow["student"] | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (tab !== "ALL") params.set("status", tab);
    if (q.trim()) params.set("q", q.trim());
    fetch(`/api/communications?${params}`)
      .then((r) => r.json())
      .then((d) => { setMessages(d.messages || []); setStats(d.stats || {}); })
      .catch(() => setMessages([]))
      .finally(() => setIsLoading(false));
  }, [tab, q]);

  useEffect(() => { setIsLoading(true); const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);

  const showFlash = (text: string) => { setFlash(text); setTimeout(() => setFlash(""), 3500); };

  const handleSend = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/communications/${id}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showFlash(data.emailed ? "Sent — parent notified by email ✓" : "Sent — visible on the parent portal ✓");
        load();
      } else showFlash(data.error || "Could not send");
    } finally { setBusyId(null); }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/communications/${id}`, { method: "DELETE" });
      load();
    } finally { setBusyId(null); }
  };

  const handleGenerate = async () => {
    const res = await fetch("/api/communications", { method: "PUT" });
    const data = await res.json().catch(() => ({}));
    showFlash(data.created > 0 ? `${data.created} fee reminder draft(s) created` : "No new drafts needed — everything is covered");
    load();
  };

  const draftCount = stats.DRAFT || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gurukul-gray pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center">
            <MessagesSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gurukul-dark">Parent Connect</h1>
            <p className="text-xs text-slate-500">Every message is reviewed and sent by a teacher — parents read them on their private portal.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerate} className="border border-slate-300 hover:border-gurukul-tech bg-white text-slate-700 font-medium text-xs px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gurukul-tech" />
            <span>Draft Fee Reminders</span>
          </button>
          <button onClick={() => setShowCompose(true)} className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2">
            <PenSquare className="w-4 h-4" />
            <span>Compose</span>
          </button>
        </div>
      </div>

      {flash && (
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" /><span>{flash}</span>
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-gurukul-gray w-fit">
          {([
            ["DRAFT", `Drafts${draftCount ? ` (${draftCount})` : ""}`],
            ["SENT", "Sent"],
            ["ACKNOWLEDGED", "Read ✓"],
            ["ALL", "All"],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${tab === key ? "bg-white text-gurukul-dark shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student..."
            className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-gurukul-tech focus:outline-none" />
        </div>
      </div>

      {/* Message list */}
      <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle divide-y divide-gurukul-gray overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-slate-400 text-center py-12">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessagesSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">{tab === "DRAFT" ? "No drafts waiting. Compose a message or submit attendance to auto-draft absence notes." : "Nothing here yet."}</p>
          </div>
        ) : (
          messages.map((m) => {
            const meta = TYPE_META[m.type] || TYPE_META.CUSTOM;
            const Icon = meta.icon;
            return (
              <div key={m.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg ${meta.cls} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gurukul-dark">{m.student.name}</span>
                      <span className="text-[10px] text-slate-400">{m.student.grade} · Roll {m.student.rollNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_CLS[m.status]}`}>
                        {m.status === "ACKNOWLEDGED" ? "Read by parent ✓" : m.status === "SENT" ? "Sent" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{m.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 whitespace-pre-line">{m.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      To {m.student.parentName}
                      {m.student.parentEmail ? ` · ${m.student.parentEmail}` : " · no email on file"}
                      {m.sentAt ? ` · sent ${new Date(m.sentAt).toLocaleString()} by ${m.sentByName || "staff"}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setLinkModal(m.student)} title="Parent portal link"
                      className="p-2 rounded-lg text-slate-400 hover:text-gurukul-tech hover:bg-gurukul-tech/10 transition-colors">
                      <Link2 className="w-4 h-4" />
                    </button>
                    {m.status === "DRAFT" && (
                      <>
                        <button onClick={() => handleDelete(m.id)} disabled={busyId === m.id} title="Discard draft"
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleSend(m.id)} disabled={busyId === m.id}
                          className="bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all">
                          <Send className="w-3.5 h-3.5" />
                          <span>{busyId === m.id ? "Sending..." : "Send"}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} onCreated={() => { setShowCompose(false); setTab("DRAFT"); load(); showFlash("Draft(s) created — review and press Send"); }} />}
      {linkModal && <PortalLinkModal student={linkModal} onClose={() => setLinkModal(null)} />}
    </div>
  );
}

/* ---------------- Compose modal ---------------- */

function ComposeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [mode, setMode] = useState<"STUDENT" | "GRADE">("STUDENT");
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<StudentLite[]>([]);
  const [grade, setGrade] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const grades = useMemo(() => Array.from(new Set(students.map((s) => s.grade))).sort(), [students]);
  const matches = useMemo(() => {
    const term = studentQuery.trim().toLowerCase();
    if (!term) return [];
    return students.filter((s) => s.name.toLowerCase().includes(term) && !selectedStudents.some((x) => x.id === s.id)).slice(0, 6);
  }, [studentQuery, students, selectedStudents]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, body, type: "CUSTOM",
          ...(mode === "STUDENT" ? { studentIds: selectedStudents.map((s) => s.id) } : { grade }),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Failed to create draft");
      else onCreated();
    } catch { setError("Network error"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
            <PenSquare className="w-4 h-4 text-gurukul-tech" /><span>Message to Parents</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setMode("STUDENT")}
              className={`text-xs font-semibold py-2 rounded-lg transition-all ${mode === "STUDENT" ? "bg-white text-gurukul-dark shadow-sm" : "text-slate-500"}`}>
              Specific students
            </button>
            <button type="button" onClick={() => setMode("GRADE")}
              className={`text-xs font-semibold py-2 rounded-lg transition-all ${mode === "GRADE" ? "bg-white text-gurukul-dark shadow-sm" : "text-slate-500"}`}>
              Whole class
            </button>
          </div>

          {mode === "STUDENT" ? (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Students</label>
              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedStudents.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1 text-[11px] bg-gurukul-tech/10 text-gurukul-tech font-semibold px-2 py-1 rounded-lg">
                      {s.name} <span className="text-gurukul-tech/60">({s.grade})</span>
                      <button type="button" onClick={() => setSelectedStudents((prev) => prev.filter((x) => x.id !== s.id))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Type a student's name..."
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none" />
              {matches.length > 0 && (
                <div className="mt-1 border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                  {matches.map((s) => (
                    <button type="button" key={s.id}
                      onClick={() => { setSelectedStudents((prev) => [...prev, s]); setStudentQuery(""); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex justify-between">
                      <span className="font-medium text-gurukul-dark">{s.name}</span>
                      <span className="text-slate-400">{s.grade} · Roll {s.rollNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Class</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} required
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-gurukul-tech focus:outline-none">
                <option value="">Choose a class...</option>
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Subject</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Parent-teacher meeting on Friday"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Message</label>
            <textarea required rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message to the parents..."
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none resize-none" />
          </div>

          <button type="submit" disabled={isSubmitting || (mode === "STUDENT" && selectedStudents.length === 0)}
            className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2">
            <PenSquare className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : "Save as Draft"}</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center">Drafts are never delivered automatically — you press Send when ready.</p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Portal link modal ---------------- */

function PortalLinkModal({ student, onClose }: { student: MessageRow["student"]; onClose: () => void }) {
  const [email, setEmail] = useState(student.parentEmail || "");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const generate = async (sendEmail: boolean) => {
    setIsBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/portal-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, email: email || undefined, sendEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setStatus(data.error || "Failed");
      else {
        setUrl(data.portalUrl);
        if (sendEmail) setStatus(data.emailed ? `Emailed to ${data.parentEmail} ✓` : data.emailError || "Email not sent — copy the link instead.");
      }
    } finally { setIsBusy(false); }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gurukul-tech" /><span>Parent Portal — {student.name}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          The private link where {student.parentName} can see attendance, fees, timetable and your messages. No app, no password.
        </p>

        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Parent email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com"
          className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none mb-3" />

        <div className="flex gap-2 mb-3">
          <button onClick={() => generate(true)} disabled={isBusy || !email}
            className="flex-1 bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /><span>{isBusy ? "Working..." : "Email the Link"}</span>
          </button>
          <button onClick={() => generate(false)} disabled={isBusy}
            className="flex-1 border border-slate-300 hover:border-gurukul-tech text-slate-700 font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /><span>Get Link Only</span>
          </button>
        </div>

        {status && <p className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-3">{status}</p>}

        {url && (
          <div className="flex items-center gap-2">
            <input readOnly value={url} onFocus={(e) => e.target.select()}
              className="flex-1 text-[11px] font-mono px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700" />
            <button onClick={copy} className="shrink-0 bg-gurukul-dark hover:bg-gurukul-dark/90 text-white text-xs font-medium px-3 py-2.5 rounded-lg flex items-center gap-1.5">
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
