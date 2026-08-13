"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Lock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";

interface PermissionRow {
  permission: string;
  description: string;
  admin: boolean;
  staff: boolean;
}

const PERMISSION_MATRIX: PermissionRow[] = [
  {
    permission: "Document Intake Upload",
    description: "Upload new student admission forms & scanned certificates",
    admin: true,
    staff: true,
  },
  {
    permission: "Document Human Review & Override",
    description: "Edit flagged OCR fields and commit verified record to DB",
    admin: true,
    staff: false,
  },
  {
    permission: "Timetable Constraint Matrix View",
    description: "Inspect master school schedule and detected clash flags",
    admin: true,
    staff: true,
  },
  {
    permission: "Approve & Publish Master Timetable",
    description: "Final authorization to deploy updated timetable to school",
    admin: true,
    staff: false,
  },
  {
    permission: "Audit Log & System Role Configuration",
    description: "Manage system roles, security policies, and access logs",
    admin: true,
    staff: false,
  },
];

export default function AdminRolesPage() {
  const { currentUser, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gurukul-gray pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">Audit & Access Control (RBAC)</h1>
            <span className="text-[10px] bg-gurukul-dark text-white font-bold px-2 py-0.5 rounded uppercase">
              Security Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Role-Based Access Control matrix governing system boundaries between Executive Admin and Teaching Staff.
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Restricted View (Staff Role Active)</p>
            <p className="text-amber-700 mt-0.5">
              You are currently viewing this page in Staff simulation mode. Use the Role Simulator pill in the header to switch to Administrator mode.
            </p>
          </div>
        </div>
      )}

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-gurukul-gray bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gurukul-dark">Access Permission Boundaries</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict RBAC enforcement across all API endpoints and server actions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-gurukul-gray text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Permission / Capability</th>
                <th className="px-6 py-3">Scope Description</th>
                <th className="px-6 py-3 text-center">Administrator Role</th>
                <th className="px-6 py-3 text-center">Staff / Faculty Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gurukul-gray">
              {PERMISSION_MATRIX.map((row) => (
                <tr key={row.permission} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gurukul-dark flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gurukul-tech" />
                    <span>{row.permission}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-sm">{row.description}</td>
                  <td className="px-6 py-4 text-center">
                    {row.admin ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        Denied
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.staff ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        Restricted
                      </span>
                    )}
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
