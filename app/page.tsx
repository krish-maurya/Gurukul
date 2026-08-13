"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Calendar, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";
import LandingPage from "@/app/landing/page";

export default function Home() {
  const { isAuthenticated, currentUser } = useAuth();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // If not authenticated, display Landing Page directly on root path /
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Proactive Top Alerts Bar (Surfaced Automatically) */}
      <div className="space-y-3">
        {!dismissedAlerts.includes("alert-doc") && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Proactive Alert: 1 Document Pending Human Review</p>
                <p className="text-[11px] text-amber-700">Admission_Form_Aarav_Sharma.pdf contains low-confidence fields (Address & Medical Notes).</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/documents"
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                Review Fields
              </Link>
              <button
                onClick={() => dismissAlert("alert-doc")}
                className="text-xs text-amber-700 hover:text-amber-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!dismissedAlerts.includes("alert-clash") && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-900">Proactive Alert: 2 Timetable Clashes Flagged</p>
                <p className="text-[11px] text-rose-700">Prof. Alan Turing double-booked at Mon Period 1; Room 101 double-booked at Mon Period 2.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/timetable"
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                Inspect Clashes
              </Link>
              <button
                onClick={() => dismissAlert("alert-clash")}
                className="text-xs text-rose-700 hover:text-rose-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!dismissedAlerts.includes("alert-attendance") && (
          <div className="p-4 bg-gurukul-tech/10 border border-gurukul-tech/20 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gurukul-tech text-white flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gurukul-dark">Proactive Alert: 3 Students Below 75% Attendance Risk</p>
                <p className="text-[11px] text-slate-600">Roll #7 (Mason Miller) & Roll #19 (Alexander Robinson) flagged in Grade 10A.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/attendance"
                className="text-xs bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                View Attendance Grid
              </Link>
              <button
                onClick={() => dismissAlert("alert-attendance")}
                className="text-xs text-slate-500 hover:text-gurukul-dark"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hero Panel */}
      <div className="rounded-2xl p-8 bg-gradient-to-r from-gurukul-dark via-[#0c1f2b] to-[#1a34a8] text-white shadow-floating relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-gurukul-ocean font-medium mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-gurukul-ocean" />
              <span>GURUKUL AI School OS Console • Logged in as {currentUser?.name} ({currentUser?.role})</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Executive Command Center
            </h1>
            <p className="text-xs md:text-sm text-gurukul-gray/90 mt-1 max-w-xl leading-relaxed">
              Automated document OCR, single-transaction roll-number attendance, constraint timetable optimizer, and AI Copilot.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/attendance"
              className="bg-gurukul-tech hover:bg-gurukul-tech/90 text-white font-semibold text-xs px-5 py-3 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2 border border-white/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Grid Attendance</span>
            </Link>
            <Link
              href="/timetable"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-5 py-3 rounded-lg backdrop-blur-sm transition-all duration-150 flex items-center gap-2 border border-white/20"
            >
              <Calendar className="w-4 h-4 text-gurukul-ocean" />
              <span>Timetable Optimizer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gurukul-gray p-5 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gurukul-dark mt-1">342 Active</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">40 Grade 10A Roll Cards</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gurukul-gray p-5 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Staff Utilization</p>
            <h3 className="text-2xl font-bold text-gurukul-dark mt-1">91.5%</h3>
            <p className="text-[11px] text-gurukul-ocean font-semibold mt-1">4 Max Periods/Day</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gurukul-dark text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-gurukul-ocean" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gurukul-gray p-5 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Today's Attendance %</p>
            <h3 className="text-2xl font-bold text-gurukul-dark mt-1">96.4%</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">37 Present / 3 Absent</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gurukul-gray p-5 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Reviews</p>
            <h3 className="text-2xl font-bold text-gurukul-dark mt-1">1 Document</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">78.5% OCR Score</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance & Utilization Trend Chart */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gurukul-gray p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gurukul-gray">
            <div>
              <h3 className="text-sm font-bold text-gurukul-dark">Attendance & Facility Utilization Trend</h3>
              <p className="text-xs text-slate-500">Weekly student attendance rate vs physical classroom occupancy.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gurukul-ocean" />
                <span className="text-slate-600">Attendance % (Ocean Blue)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gurukul-tech" />
                <span className="text-slate-600">Room Utilization % (Tech Blue)</span>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-slate-200 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300">
              <div className="border-b border-slate-100 pb-1">100%</div>
              <div className="border-b border-slate-100 pb-1">75%</div>
              <div className="border-b border-slate-100 pb-1">50%</div>
              <div className="border-b border-slate-100 pb-1">25%</div>
            </div>

            {[
              { day: "Mon", attendance: 95, room: 88 },
              { day: "Tue", attendance: 98, room: 92 },
              { day: "Wed", attendance: 94, room: 85 },
              { day: "Thu", attendance: 96, room: 90 },
              { day: "Fri", attendance: 97, room: 94 },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 z-10">
                <div className="w-full flex justify-center items-end gap-2 h-44">
                  <div
                    className="w-5 bg-gurukul-ocean rounded-t-md transition-all duration-300 hover:brightness-110"
                    style={{ height: `${d.attendance}%` }}
                    title={`Attendance: ${d.attendance}%`}
                  />
                  <div
                    className="w-5 bg-gurukul-tech rounded-t-md transition-all duration-300 hover:brightness-110"
                    style={{ height: `${d.room}%` }}
                    title={`Room Utilization: ${d.room}%`}
                  />
                </div>
                <span className="text-xs font-bold text-gurukul-dark">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Feed */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gurukul-gray p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gurukul-dark pb-3 border-b border-gurukul-gray mb-4">
              Real-Time Audit Activity Feed
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gurukul-dark">Grade 10A Attendance Submitted</p>
                  <p className="text-slate-500 text-[11px]">Period 1 • 37 Present / 3 Absent</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">10:15 AM by Prof. Alan Turing</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gurukul-dark">OCR Document Ingested</p>
                  <p className="text-slate-500 text-[11px]">Admission_Form_Aarav_Sharma.pdf (78.5%)</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">09:45 AM by System OCR</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gurukul-dark">Timetable Conflict Detected</p>
                  <p className="text-slate-500 text-[11px]">Prof. Turing double booked Mon P1</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">09:00 AM by Solver Engine</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gurukul-gray mt-6">
            <Link
              href="/admin/roles"
              className="text-xs font-semibold text-gurukul-tech hover:underline flex items-center justify-between"
            >
              <span>View Security Audit Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
