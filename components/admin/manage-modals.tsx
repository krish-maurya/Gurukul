"use client";

import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle, CheckCircle, IndianRupee, Receipt, Pencil, GraduationCap } from "lucide-react";

/* =========================================================================
 * Edit Student modal (ADMIN only) — includes the parent email field
 * =======================================================================*/

interface StudentFull {
  id: string; name: string; dob: string; grade: string; parentName: string;
  contact: string; parentEmail?: string | null; address?: string | null;
  medicalNotes?: string | null; previousSchool?: string | null; status: string;
}

export function EditStudentModal({ studentId, onClose, onSaved }: { studentId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<StudentFull | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${studentId}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setForm(d)))
      .catch(() => setError("Failed to load student"));
  }, [studentId]);

  const set = (key: keyof StudentFull, value: string) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError("");
    setIsSaving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, dob: form.dob, grade: form.grade, parentName: form.parentName,
          contact: form.contact, parentEmail: form.parentEmail ?? "", address: form.address ?? "",
          medicalNotes: form.medicalNotes ?? "", previousSchool: form.previousSchool ?? "", status: form.status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Failed to save");
      else onSaved();
    } catch { setError("Network error"); }
    finally { setIsSaving(false); }
  };

  const input = "w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none";
  const label = "text-xs font-semibold text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
            <Pencil className="w-4 h-4 text-gurukul-tech" /><span>Edit Student</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        {!form ? (
          <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Full Name</label><input required className={input} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div><label className={label}>Date of Birth</label><input required className={input} value={form.dob} onChange={(e) => set("dob", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Grade / Class</label><input required className={input} value={form.grade} onChange={(e) => set("grade", e.target.value)} /></div>
              <div>
                <label className={label}>Status</label>
                <select className={input} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="ADMITTED">ADMITTED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Parent / Guardian</label><input required className={input} value={form.parentName} onChange={(e) => set("parentName", e.target.value)} /></div>
              <div><label className={label}>Contact Number</label><input required className={input} value={form.contact} onChange={(e) => set("contact", e.target.value)} /></div>
            </div>
            <div>
              <label className={label}>Parent Email <span className="text-slate-400 font-normal">(for the parent portal link)</span></label>
              <input type="email" className={input} placeholder="parent@example.com" value={form.parentEmail ?? ""} onChange={(e) => set("parentEmail", e.target.value)} />
            </div>
            <div><label className={label}>Address</label><input className={input} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Medical Notes</label><input className={input} value={form.medicalNotes ?? ""} onChange={(e) => set("medicalNotes", e.target.value)} /></div>
              <div><label className={label}>Previous School</label><input className={input} value={form.previousSchool ?? ""} onChange={(e) => set("previousSchool", e.target.value)} /></div>
            </div>
            <button type="submit" disabled={isSaving}
              className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2">
              <Save className="w-4 h-4" /><span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
 * Manage Fees modal (ADMIN only) — set amount due + record payments
 * =======================================================================*/

interface FeeAccountData {
  academicYear: string; amountDue: number; amountPaid: number; dueDate: string; status: string;
  payments: { id: string; amount: number; paidAt: string; method: string; receiptNo: string }[];
}

const FEE_STATUS_CLS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  PARTIAL: "bg-sky-100 text-sky-800 border border-sky-200",
  PENDING: "bg-slate-100 text-slate-600 border border-slate-200",
  OVERDUE: "bg-red-100 text-red-700 border border-red-200",
};

export function ManageFeesModal({ studentId, studentName, onClose, onChanged }: { studentId: string; studentName: string; onClose: () => void; onChanged?: () => void }) {
  const [account, setAccount] = useState<FeeAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  // set-amount form
  const [amountDue, setAmountDue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-27");
  // payment form
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [isBusy, setIsBusy] = useState(false);

  const load = () => {
    fetch(`/api/students/${studentId}/fees`)
      .then((r) => r.json())
      .then((d) => {
        setAccount(d.account);
        if (d.account) {
          setAmountDue(String(d.account.amountDue));
          setDueDate(d.account.dueDate);
          setAcademicYear(d.account.academicYear);
        }
      })
      .catch(() => setError("Failed to load fees"))
      .finally(() => setIsLoading(false));
  };
  useEffect(load, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const showFlash = (t: string) => { setFlash(t); setTimeout(() => setFlash(""), 3000); };

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setIsBusy(true);
    try {
      const res = await fetch(`/api/students/${studentId}/fees`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountDue: Number(amountDue), dueDate, academicYear }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Failed to save");
      else { setAccount(data.account); showFlash("Fee details saved ✓"); onChanged?.(); }
    } finally { setIsBusy(false); }
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setIsBusy(true);
    try {
      const res = await fetch(`/api/students/${studentId}/fees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(payAmount), method: payMethod }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Failed to record payment");
      else { setAccount(data.account); setPayAmount(""); showFlash(`Payment recorded — receipt ${data.receiptNo} ✓`); onChanged?.(); }
    } finally { setIsBusy(false); }
  };

  const remaining = account ? Math.max(0, account.amountDue - account.amountPaid) : 0;
  const input = "w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none";
  const label = "text-xs font-semibold text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gurukul-tech" /><span>Fees — {studentName}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}
        {flash && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 mb-4 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" /><span>{flash}</span>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
        ) : (
          <div className="space-y-5">
            {/* Summary */}
            {account && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl border border-slate-200 py-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Total</p>
                  <p className="text-sm font-bold text-gurukul-dark">₹{account.amountDue.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 py-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Paid</p>
                  <p className="text-sm font-bold text-emerald-600">₹{account.amountPaid.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 py-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Remaining</p>
                  <p className="text-sm font-bold text-gurukul-dark">₹{remaining.toLocaleString("en-IN")}</p>
                </div>
              </div>
            )}
            {account && (
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${FEE_STATUS_CLS[account.status] || FEE_STATUS_CLS.PENDING}`}>
                {account.status} · due {account.dueDate}
              </span>
            )}

            {/* Set / update fee amount */}
            <form onSubmit={saveAccount} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gurukul-dark">{account ? "Update fee details" : "Set the fee for this student"}</p>
              <div className="grid grid-cols-3 gap-2">
                <div><label className={label}>Amount (₹)</label><input required type="number" min="1" className={input} value={amountDue} onChange={(e) => setAmountDue(e.target.value)} placeholder="45000" /></div>
                <div><label className={label}>Due Date</label><input required type="date" className={input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
                <div><label className={label}>Year</label><input required className={input} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} /></div>
              </div>
              <button type="submit" disabled={isBusy}
                className="w-full border border-gurukul-tech text-gurukul-tech hover:bg-gurukul-tech hover:text-white disabled:opacity-60 font-semibold text-xs py-2 rounded-lg transition-colors">
                {account ? "Update Fee Details" : "Create Fee Account"}
              </button>
            </form>

            {/* Record payment */}
            {account && remaining > 0 && (
              <form onSubmit={recordPayment} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-gurukul-dark">Record a payment</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={label}>Amount (₹)</label><input required type="number" min="1" max={remaining} className={input} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={String(remaining)} /></div>
                  <div>
                    <label className={label}>Method</label>
                    <select className={input} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                      <option value="CASH">Cash</option><option value="UPI">UPI</option>
                      <option value="CARD">Card</option><option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={isBusy}
                  className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" /><span>Record Payment</span>
                </button>
              </form>
            )}

            {/* Payment history */}
            {account && account.payments.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Payment history</p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {account.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 text-xs">
                      <span className="font-semibold text-gurukul-dark">₹{p.amount.toLocaleString("en-IN")}</span>
                      <span className="text-slate-400">{p.method}</span>
                      <span className="text-slate-400">{p.paidAt}</span>
                      <span className="font-mono text-[10px] text-slate-400">{p.receiptNo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
 * Edit Staff modal (ADMIN only)
 * =======================================================================*/

interface StaffEditData {
  id: string; name: string; email: string; department: string;
  maxPeriodsPerDay: number; maxPeriodsPerWeek: number; isActive: boolean;
}

export function EditStaffModal({ staff, onClose, onSaved }: { staff: StaffEditData; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<StaffEditData>({ ...staff });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setIsSaving(true);
    try {
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, department: form.department,
          maxPeriodsPerDay: form.maxPeriodsPerDay, maxPeriodsPerWeek: form.maxPeriodsPerWeek, isActive: form.isActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Failed to save");
      else onSaved();
    } catch { setError("Network error"); }
    finally { setIsSaving(false); }
  };

  const input = "w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none";
  const label = "text-xs font-semibold text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
            <Pencil className="w-4 h-4 text-gurukul-tech" /><span>Edit Teacher</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div><label className={label}>Full Name</label><input required className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className={label}>Email <span className="text-slate-400 font-normal">(login updates too)</span></label><input required type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className={label}>Department</label><input required className={input} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Max periods / day</label><input required type="number" min="1" max="8" className={input} value={form.maxPeriodsPerDay} onChange={(e) => setForm({ ...form, maxPeriodsPerDay: Number(e.target.value) })} /></div>
            <div><label className={label}>Max periods / week</label><input required type="number" min="1" max="40" className={input} value={form.maxPeriodsPerWeek} onChange={(e) => setForm({ ...form, maxPeriodsPerWeek: Number(e.target.value) })} /></div>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 py-1 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-gurukul-tech focus:ring-gurukul-tech" />
            <span>Active (inactive teachers can&apos;t sign in or be scheduled)</span>
          </label>
          <button type="submit" disabled={isSaving}
            className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 mt-1">
            <Save className="w-4 h-4" /><span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
 * Class Fees modal (ADMIN only) — same fee for a whole STANDARD in one go.
 * Fees don't differ by division: "Grade 10" covers 10A + 10B together.
 * =======================================================================*/

/** "Grade 10A" -> { standard: "Grade 10", division: "A" } */
function splitGrade(g: string): { standard: string; division: string } {
  const m = g.match(/^(.*\d)\s*([A-Za-z])$/);
  return m ? { standard: m[1].trim(), division: m[2].toUpperCase() } : { standard: g, division: "" };
}

export function BatchFeesModal({ grades, onClose, onDone }: { grades: string[]; onClose: () => void; onDone?: () => void }) {
  // Group divisions under their standard: Grade 10 -> [A, B]
  const standards = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const g of grades) {
      const { standard, division } = splitGrade(g);
      const list = map.get(standard) || [];
      if (division && !list.includes(division)) list.push(division);
      map.set(standard, list.sort());
    }
    return Array.from(map.entries()).map(([standard, divisions]) => ({ standard, divisions }));
  }, [grades]);

  const [standard, setStandard] = useState(standards[0]?.standard || "");
  const [amountDue, setAmountDue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<{ created: number; updated: number; skipped: number; totalStudents: number; grade: string; amountDue: number } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSummary(null); setIsBusy(true);
    try {
      const res = await fetch("/api/fees/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: standard, amountDue: Number(amountDue), dueDate, academicYear, overwrite }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Failed to set class fees");
      else { setSummary(data); onDone?.(); }
    } catch { setError("Network error"); }
    finally { setIsBusy(false); }
  };

  const input = "w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none";
  const label = "text-xs font-semibold text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-gurukul-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gurukul-dark flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gurukul-tech" /><span>Set Class Fees</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Fees are the same for every division of a standard. Pick a standard and the fee is
          applied to <strong>all its divisions</strong> at once — you can still fine-tune any
          single student later via <strong>Manage Fees</strong>.
        </p>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        {summary ? (
          <div className="space-y-4">
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-3 space-y-1 font-medium">
              <div className="flex items-center gap-2 font-bold"><CheckCircle className="w-4 h-4 shrink-0" /><span>{summary.grade} (all divisions): ₹{summary.amountDue.toLocaleString("en-IN")} applied</span></div>
              <p>• {summary.created} student{summary.created === 1 ? "" : "s"} — fee account created</p>
              {summary.updated > 0 && <p>• {summary.updated} — existing fee updated (payments kept)</p>}
              {summary.skipped > 0 && <p>• {summary.skipped} — skipped (already had a fee; tick the overwrite box to update them too)</p>}
            </div>
            <button onClick={onClose} className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium py-2.5 rounded-lg">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={label}>Standard</label>
              <div className="grid grid-cols-3 gap-2">
                {standards.map(({ standard: st, divisions }) => {
                  const active = st === standard;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStandard(st)}
                      className={`group relative rounded-xl border-2 px-2 py-3 text-center transition-all ${
                        active
                          ? "border-gurukul-tech bg-gurukul-tech text-white shadow-md"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <GraduationCap className={`w-4 h-4 mx-auto mb-1 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-500"}`} />
                      <span className="block text-xs font-bold leading-tight">{st}</span>
                      {divisions.length > 0 && (
                        <span className={`block text-[10px] mt-0.5 ${active ? "text-white/70" : "text-slate-400"}`}>
                          Div {divisions.join(" · ")}
                        </span>
                      )}
                      {active && (
                        <span className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow">
                          <CheckCircle className="w-4 h-4 text-gurukul-tech" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className={label}>Amount (₹)</label><input required type="number" min="1" className={input} value={amountDue} onChange={(e) => setAmountDue(e.target.value)} placeholder="45000" /></div>
              <div><label className={label}>Due Date</label><input required type="date" className={input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              <div><label className={label}>Year</label><input required className={input} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} /></div>
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-600 py-1 cursor-pointer">
              <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-gurukul-tech focus:ring-gurukul-tech" />
              <span>Also update students who <strong>already have a fee</strong> set for this standard (their payments are kept, only the amount/due date changes)</span>
            </label>
            <button type="submit" disabled={isBusy}
              className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2">
              <IndianRupee className="w-4 h-4" /><span>{isBusy ? "Applying..." : "Apply to Whole Standard"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
