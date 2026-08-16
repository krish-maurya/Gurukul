"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Calendar,
  FileText,
  UserCheck,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gurukul-dark font-sans">
      {/* Navigation Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gurukul-dark flex items-center justify-center text-white text-[11px] font-bold tracking-wider">
              G
            </div>
            <span className="font-semibold text-sm tracking-tight">Gurukul</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-500">
            <a href="#features" className="hover:text-gurukul-dark transition-colors">Features</a>
            <a href="#roles" className="hover:text-gurukul-dark transition-colors">Roles</a>
            <a href="#copilot" className="hover:text-gurukul-dark transition-colors">AI Copilot</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-medium text-neutral-500 hover:text-gurukul-dark transition-colors">
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-xs font-medium bg-gurukul-dark text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600 font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            <span>AI-first School Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gurukul-dark leading-[1.15]">
            The intelligent way to
            <br />
            run your school
          </h1>

          <p className="mt-5 text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Automated attendance tracking, document OCR processing, timetable conflict resolution,
            and natural language AI — all in one minimal interface.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="btn-primary w-full sm:w-auto"
            >
              <span>Sign in to system</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button className="btn-secondary w-full sm:w-auto">
              <span>Explore features</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-neutral-200 rounded-xl overflow-hidden">
            {[
              {
                icon: UserCheck,
                title: "Grid Attendance",
                description: "40-student batch roll call with one-tap toggle. Track daily presence instantly.",
              },
              {
                icon: FileText,
                title: "Document OCR",
                description: "Upload scanned admission forms. Tesseract extracts 21+ fields with confidence scoring.",
              },
              {
                icon: Calendar,
                title: "Timetable Solver",
                description: "Constraint-based scheduling detects teacher and room conflicts. AI suggests fixes.",
              },
              {
                icon: Sparkles,
                title: "AI Copilot",
                description: "Natural language queries across students, attendance, and staff. Persistent chat drawer.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 hover:bg-neutral-50 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-neutral-400 mb-3" />
                <h3 className="text-sm font-semibold text-gurukul-dark">{feature.title}</h3>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Section */}
      <section id="roles" className="px-6 pb-20 bg-neutral-50 py-20 border-y border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold tracking-tight text-gurukul-dark">Built for two roles</h2>
            <p className="text-xs text-neutral-500 mt-2 max-w-md mx-auto">
              Role-based access ensures administrators maintain oversight while teachers manage daily tasks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                role: "Administrator",
                badge: "Executive",
                description: "Full governance, audit logs, RBAC permissions, global attendance oversight, and timetable configuration.",
                features: ["Audit & Access Control", "Document Review & Verification", "Executive Analytics"],
                icon: ShieldCheck,
              },
              {
                role: "Teacher",
                badge: "Faculty",
                description: "Streamlined batch attendance, personal timetable view, student registry, and AI Copilot assistance.",
                features: ["Batch Grid Attendance", "Timetable Schedule View", "Interactive AI Copilot"],
                icon: UserCheck,
              },
            ].map((item) => (
              <div key={item.role} className="card p-6">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
                  <item.icon className="w-4 h-4 text-neutral-600" />
                </div>
                <span className="badge-dark">{item.badge}</span>
                <h3 className="text-base font-semibold text-gurukul-dark mt-3">{item.role}</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{item.description}</p>
                <ul className="mt-4 space-y-2">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-neutral-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gurukul-dark flex items-center justify-center text-white font-bold text-[9px]">
              G
            </div>
            <span className="font-medium text-neutral-600">Gurukul</span>
          </div>
          <p>&copy; 2026 Gurukul Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
