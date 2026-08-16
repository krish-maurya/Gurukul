"use client";

import React, { useState, Suspense } from "react";
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
  TrendingUp,
  Clock,
  UserCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";
import { SkeletonDashboard } from "@/components/ui/loaders";

function DashboardContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  if (!isAuthenticated) {
    return null;
  }

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Top Alerts */}
      <div className="space-y-2">
        {!dismissedAlerts.includes("alert-doc") && (
          <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-slide-up">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-amber-900 truncate">1 Document Pending Review</p>
                <p className="text-[10px] text-amber-700 truncate">Low-confidence fields detected.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/documents" className="text-[10px] font-medium bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md transition-colors">
                Review
              </Link>
              <button onClick={() => dismissAlert("alert-doc")} className="p-1 text-amber-400 hover:text-amber-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {!dismissedAlerts.includes("alert-clash") && (
          <div className="flex items-center justify-between gap-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-md bg-red-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-red-900 truncate">2 Timetable Clashes Flagged</p>
                <p className="text-[10px] text-red-700 truncate">Double-booked teacher and room.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/timetable" className="text-[10px] font-medium bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md transition-colors">
                Inspect
              </Link>
              <button onClick={() => dismissAlert("alert-clash")} className="p-1 text-red-400 hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {!dismissedAlerts.includes("alert-attendance") && (
          <div className="flex items-center justify-between gap-3 p-3 bg-neutral-100 border border-neutral-200 rounded-lg animate-slide-up">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-md bg-gurukul-dark text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gurukul-dark truncate">3 Students Below 75% Attendance</p>
                <p className="text-[10px] text-neutral-500 truncate">Roll #7 and #19 flagged in Grade 10A.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/attendance" className="text-[10px] font-medium bg-gurukul-dark hover:bg-neutral-800 text-white px-2.5 py-1 rounded-md transition-colors">
                View
              </Link>
              <button onClick={() => dismissAlert("alert-attendance")} className="p-1 text-neutral-400 hover:text-gurukul-dark">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Welcome Banner */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-400 mb-1">
              {currentUser?.role} &middot; {currentUser?.name}
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-gurukul-dark">Dashboard</h1>
            <p className="text-xs text-neutral-400 mt-1">Overview of school operations and key metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/attendance" className="btn-primary btn-sm">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Attendance</span>
            </Link>
            <Link href="/timetable" className="btn-secondary btn-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>Timetable</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "342", detail: "40 Grade 10A", icon: GraduationCap, color: "text-neutral-500" },
          { label: "Staff Utilization", value: "91.5%", detail: "4 Max Periods/Day", icon: Users, color: "text-neutral-500" },
          { label: "Today's Attendance", value: "96.4%", detail: "37 Present / 3 Absent", icon: UserCheck, color: "text-neutral-500" },
          { label: "Pending Reviews", value: "1", detail: "78.5% OCR Score", icon: FileText, color: "text-neutral-500" },
        ].map((metric) => (
          <div key={metric.label} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{metric.label}</p>
                <h3 className="text-xl font-bold text-gurukul-dark mt-1">{metric.value}</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">{metric.detail}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart */}
        <div className="lg:col-span-8 card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-semibold text-gurukul-dark">Weekly Trends</h3>
              <p className="text-[10px] text-neutral-400">Attendance vs room utilization.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-800" />
                <span className="text-neutral-500">Attendance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-300" />
                <span className="text-neutral-500">Room Util.</span>
              </div>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-neutral-100 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-neutral-300">
              <div className="border-b border-neutral-50 pb-1">100%</div>
              <div className="border-b border-neutral-50 pb-1">75%</div>
              <div className="border-b border-neutral-50 pb-1">50%</div>
              <div className="border-b border-neutral-50 pb-1">25%</div>
            </div>
            {[
              { day: "Mon", attendance: 95, room: 88 },
              { day: "Tue", attendance: 98, room: 92 },
              { day: "Wed", attendance: 94, room: 85 },
              { day: "Thu", attendance: 96, room: 90 },
              { day: "Fri", attendance: 97, room: 94 },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 z-10">
                <div className="w-full flex justify-center items-end gap-1.5 h-36">
                  <div
                    className="w-4 bg-gurukul-dark rounded-t-sm transition-all duration-300"
                    style={{ height: `${d.attendance}%` }}
                  />
                  <div
                    className="w-4 bg-neutral-300 rounded-t-sm transition-all duration-300"
                    style={{ height: `${d.room}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-neutral-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Feed */}
        <div className="lg:col-span-4 card p-5 flex flex-col">
          <h3 className="text-xs font-semibold text-gurukul-dark pb-3 border-b border-neutral-100 mb-3">
            Recent Activity
          </h3>

          <div className="space-y-3 flex-1">
            {[
              { dot: "bg-emerald-500", title: "Grade 10A Attendance Submitted", detail: "37 Present / 3 Absent", time: "10:15 AM" },
              { dot: "bg-amber-500", title: "OCR Document Ingested", detail: "Admission form (78.5%)", time: "09:45 AM" },
              { dot: "bg-red-500", title: "Timetable Conflict Detected", detail: "Turing double booked Mon P1", time: "09:00 AM" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                <div>
                  <p className="text-[11px] font-medium text-gurukul-dark">{item.title}</p>
                  <p className="text-[10px] text-neutral-400">{item.detail}</p>
                  <p className="text-[9px] text-neutral-300 font-mono mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 mt-3">
            <Link
              href="/admin/roles"
              className="text-[10px] font-medium text-neutral-500 hover:text-gurukul-dark transition-colors flex items-center gap-1"
            >
              <span>View security audit</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <DashboardContent />
    </Suspense>
  );
}
