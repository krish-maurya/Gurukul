"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Calendar,
  FileText,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart3,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gurukul-dark text-white font-sans selection:bg-gurukul-tech selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gurukul-tech/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gurukul-ocean/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Public Navigation Header */}
      <header className="relative z-10 border-b border-white/10 bg-gurukul-dark/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gurukul-tech to-gurukul-ocean flex items-center justify-center font-bold text-white tracking-widest text-lg shadow-lg shadow-gurukul-tech/30">
              G
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">GURUKUL</span>
              <span className="text-[10px] block text-gurukul-ocean font-semibold tracking-widest uppercase">
                AI School OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Core Modules
            </a>
            <a href="#roles" className="hover:text-white transition-colors">
              Role Based Access
            </a>
            <a href="#copilot" className="hover:text-white transition-colors">
              AI Copilot Engine
            </a>
            <a href="#stats" className="hover:text-white transition-colors">
              Performance
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <button
              className="text-xs font-bold bg-gradient-to-r from-gurukul-tech to-gurukul-ocean text-white px-5 py-2.5 rounded-xl shadow-lg shadow-gurukul-tech/25 hover:shadow-gurukul-tech/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Explore Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-6 max-w-7xl mx-auto text-center">
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gurukul-ocean font-medium mb-8 shadow-inner animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-gurukul-ocean" />
          <span>Next-Generation AI Operating System for Modern Schools</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          The Intelligent Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-gurukul-ocean via-blue-400 to-indigo-300">Modern School Leadership</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Streamline grid attendance tracking, process real scanned admission documents with Tesseract OCR, resolve timetable clashes instantly, and execute administrative queries using natural language AI Copilot.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto text-sm font-bold bg-gurukul-tech hover:bg-gurukul-tech/90 text-white px-8 py-3.5 rounded-xl shadow-xl shadow-gurukul-tech/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In to System</span>
          </Link>
          <button
            className="w-full sm:w-auto text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 px-7 py-3.5 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Launch as Teacher</span>
          </button>
        </div>

        {/* Hero Feature Badges */}
        <div className="mt-12 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <UserCheck className="w-5 h-5 text-gurukul-ocean mb-2" />
            <h4 className="text-xs font-semibold text-white">40-Student Batch Grid</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Instant roll call & attendance risk flags</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <FileText className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="text-xs font-semibold text-white">Real Image OCR Engine</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Tesseract client-side field extraction</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <Calendar className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-xs font-semibold text-white">Timetable Solver</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero-clash teacher & room allocation</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-xs font-semibold text-white">LinkedIn-Style Copilot</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Persistent AI drawer across all sections</p>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="roles" className="relative z-10 py-20 px-6 bg-slate-950/60 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-gurukul-ocean uppercase">Role Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Built for School Leadership & Teaching Faculty</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3">
              Role-based access control (RBAC) ensures administrators maintain executive oversight while teachers manage daily classroom tasks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Admin Role Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-gurukul-ocean/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gurukul-ocean/20 border border-gurukul-ocean/30 text-gurukul-ocean flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold tracking-wider bg-gurukul-tech/30 text-gurukul-ocean px-3 py-1 rounded-full uppercase">
                Executive Role
              </span>
              <h3 className="text-xl font-bold text-white mt-3">School Principal / Administrator</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Full governance, system audit logs, RBAC permission matrix, global attendance risk oversight, and timetable constraint configuration.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Audit & Access Control (RBAC)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Document OCR Intake Review & Verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Executive School Analytics & Risk Alerts</span>
                </li>
              </ul>
              <button
                className="mt-8 w-full py-3 rounded-xl bg-gurukul-tech text-white font-semibold text-xs hover:bg-gurukul-tech/90 transition-colors shadow-lg shadow-gurukul-tech/20 flex items-center justify-center gap-2"
              >
                <span>Enter as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher Role Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full uppercase">
                Faculty Role
              </span>
              <h3 className="text-xl font-bold text-white mt-3">Class Teacher & Educator</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Streamlined 40-student batch grid attendance taking, personal timetable schedules, student registry lookup, and AI Copilot assistance.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Batch Grid Attendance (Roll Numbers 1-40)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Timetable Class Schedule View</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Interactive AI Copilot Queries</span>
                </li>
              </ul>
              <button
                className="mt-8 w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Enter as Teacher</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-6 bg-gurukul-dark">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gurukul-tech flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <span className="font-semibold text-white">GURUKUL AI OS</span>
            <span>— AI-first School Operating System</span>
          </div>
          <p>© 2026 GURUKUL Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
