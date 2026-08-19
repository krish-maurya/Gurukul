"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  FileText,
  UserCheck,
  Sparkles,
  ShieldCheck,
  ScanLine,
  Users,
  ClipboardCheck,
  MessageSquare,
  Smartphone,
  QrCode,
  Star,
} from "lucide-react";

const SCHOOL_APP_DOWNLOAD_URL =
  "https://expo.dev/accounts/snehp.03/projects/gurukul/builds/d9882f3a-fb3a-43ac-a152-0aa9bf44b3ba";
const PARENT_APP_DOWNLOAD_URL =
  "https://expo.dev/accounts/snehp.03/projects/gurukul-parent/builds/31176960-38d3-4705-a483-50a8419609ec";

export default function LandingPage() {
  return (
    <div className="gurukul-landing min-h-screen bg-white text-gurukul-ink font-sans">
      {/* Local design tokens — merge into globals.css when convenient */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap");
        .gurukul-landing {
          --brass: #a9803f;
          --brass-soft: #f4ecdb;
          --saffron: #e87900;
          --ink-deep: #0c1230;
          --font-body: "Inter", system-ui, sans-serif;
          --font-mono: "JetBrains Mono", ui-monospace, monospace;
        }
        .gurukul-landing body,
        .gurukul-landing p,
        .gurukul-landing span,
        .gurukul-landing li,
        .gurukul-landing a {
          font-family: var(--font-body);
        }
        .gurukul-landing .mono {
          font-family: var(--font-mono);
          letter-spacing: 0.02em;
        }
        @keyframes seal-in {
          from { opacity: 0; transform: rotate(-18deg) scale(0.85); }
          to { opacity: 1; transform: rotate(-8deg) scale(1); }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .seal-badge { animation: seal-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .float-card { animation: float-card 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .seal-badge, .float-card { animation: none; }
        }
      `}</style>

      {/* Navigation Header */}
      <header className="border-b sticky top-0 z-50 bg-white/90 backdrop-blur" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold tracking-wider" style={{ background: "var(--accent)" }}>
              G
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Gurukul</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium" style={{ color: "var(--muted)" }}>
            {[
              ["Features", "#features"],
              ["How it works", "#pipeline"],
              ["Roles", "#roles"],
              ["AI Copilot", "#copilot"],
              ["Get the app", "/mobile-app"],
            ].map(([label, href]) => (
              href.startsWith("/") ? (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  {label}
                </Link>
              ) : (
              <a
                key={href}
                href={href}
                className="transition-colors"
                style={{ color: "var(--muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {label}
              </a>
              )
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-medium transition-colors" style={{ color: "var(--muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-xs font-medium text-white px-4 py-2 rounded-lg transition-all"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-text)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(30, 58, 138, 0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[440px] pointer-events-none" style={{ background: "radial-gradient(circle at 50% 30%, var(--accent-glow), transparent 60%)" }} />
        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium mb-6" style={{ background: "var(--accent-soft)", color: "var(--accent-text)", border: "1px solid rgba(30, 58, 138, 0.18)" }}>
              <Sparkles className="w-3 h-3" />
              <span>AI-first School Operating System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.12]" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>
              Every roll call, form,
              <br />
              and timetable —
              <br />
              <span style={{ color: "var(--accent)" }}>verified, not guessed.</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base max-w-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              Gurukul reads your admission forms, fills your attendance grid, and untangles your
              timetable — then hands every record to an AI Copilot that answers questions in plain
              language, for administrators and teachers alike.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/login" className="btn-primary w-full sm:w-auto">
                <span>Sign in to system</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/mobile-app" className="btn-secondary w-full sm:w-auto">
                <span>Get the mobile app</span>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 mono text-[11px]" style={{ color: "var(--faint)" }}>
              <span>40-STUDENT GRID</span>
              <span className="w-1 h-1 rounded-full" style={{ background: "var(--line)" }} />
              <span>21+ FIELDS OCR</span>
              <span className="w-1 h-1 rounded-full" style={{ background: "var(--line)" }} />
              <span>ZERO CLASH TIMETABLES</span>
            </div>
          </div>

          {/* Signature visual: attendance card + verification seal */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="float-card card w-full max-w-sm p-5" style={{ boxShadow: "0 20px 50px -20px rgba(15, 31, 82, 0.35)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-syne)" }}>Batch 9-B · Attendance</span>
                <span className="mono text-[10px]" style={{ color: "var(--faint)" }}>17 AUG</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: 40 }).map((_, i) => {
                  const absent = [4, 13, 27].includes(i);
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-[5px] flex items-center justify-center"
                      style={{
                        background: absent ? "#FDEBEC" : "var(--accent-soft)",
                        border: `1px solid ${absent ? "#F3C6C9" : "rgba(30,58,138,0.16)"}`,
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: absent ? "#D95A5A" : "var(--accent)" }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px]" style={{ color: "var(--muted)" }}>
                <span>37 present · 3 absent</span>
                <span className="mono" style={{ color: "var(--accent-text)" }}>SYNCED</span>
              </div>
            </div>

            {/* Verification seal, echoes the document-OCR feature */}
            <div
              className="seal-badge absolute -top-6 -left-6 w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "var(--brass-soft)",
                border: "2px solid var(--brass)",
                transform: "rotate(-8deg)",
              }}
            >
              <div className="text-center leading-none">
                <ShieldCheck className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--brass)" }} />
                <span className="block mono text-[8px] tracking-widest" style={{ color: "var(--brass)" }}>VERIFIED</span>
                <span className="block mono text-[7px] tracking-widest" style={{ color: "var(--brass)" }}>RECORD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-md">
            <span className="mono text-[11px]" style={{ color: "var(--brass)" }}>WHAT'S INSIDE</span>
            <h2 className="text-2xl font-bold tracking-tight mt-2" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>
              One system, six jobs done properly
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden" style={{ background: "var(--line)" }}>
            {[
              { icon: UserCheck, title: "Grid Attendance", description: "40-student batch roll call with one-tap toggle. Track daily presence instantly, synced across devices." },
              { icon: FileText, title: "Document OCR", description: "Upload scanned admission forms. Tesseract extracts 21+ fields with confidence scoring per field." },
              { icon: Calendar, title: "Timetable Solver", description: "Constraint-based scheduling detects teacher and room conflicts before they happen. AI suggests fixes." },
              { icon: MessageSquare, title: "AI Copilot", description: "Natural language queries across students, attendance, and staff. Lives in a persistent chat drawer." },
              { icon: ShieldCheck, title: "Audit & Access", description: "Every edit is logged with who, what, and when. Role-based permissions keep the record honest." },
              { icon: Users, title: "Student Registry", description: "One record per student, shared across admissions, attendance, and timetable — never re-entered." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
              >
                <feature.icon className="w-5 h-5 mb-3" style={{ color: "var(--accent)" }} />
                <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-syne)" }}>{feature.title}</h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline / how the OCR verification actually works — a real sequence, so numbering earns its place */}
      <section id="pipeline" className="px-6 py-24 border-y" style={{ background: "var(--soft)", borderColor: "var(--line)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 max-w-md">
            <span className="mono text-[11px]" style={{ color: "var(--brass)" }}>ADMISSION FORM → VERIFIED RECORD</span>
            <h2 className="text-2xl font-bold tracking-tight mt-2" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>
              What happens the moment you scan a form
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: ScanLine, title: "Scan", description: "Photograph or upload the admission form, any angle, any phone camera." },
              { step: "02", icon: Sparkles, title: "Extract", description: "Tesseract OCR pulls 21+ fields — name, guardian, address, prior school — with a confidence score each." },
              { step: "03", icon: ClipboardCheck, title: "Verify", description: "Low-confidence fields are flagged for a human glance. Nothing enters the registry unreviewed." },
              { step: "04", icon: ShieldCheck, title: "Seal", description: "The record is stamped, timestamped, and locked into the audit trail — visible to every role that needs it." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="mono text-3xl font-semibold" style={{ color: "var(--line)" }}>{item.step}</span>
                <item.icon className="w-4 h-4 -mt-6 mb-3" style={{ color: "var(--accent)" }} />
                <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-syne)" }}>{item.title}</h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Copilot spotlight */}
      <section id="copilot" className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="mono text-[11px]" style={{ color: "var(--brass)" }}>ASK, DON'T DIG</span>
            <h2 className="text-2xl font-bold tracking-tight mt-2 leading-snug" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>
              "Which 9th-graders were absent
              <br />
              more than four times this term?"
            </h2>
            <p className="mt-4 text-sm leading-relaxed max-w-md" style={{ color: "var(--muted)" }}>
              The Copilot answers in a sentence, with a link to the underlying records — instead of
              a spreadsheet filter you have to remember how to build. It reads across students,
              attendance, staff, and timetables, scoped to whatever your role can see.
            </p>
          </div>

          <div className="card p-5 max-w-md w-full mx-auto" style={{ boxShadow: "0 16px 40px -20px rgba(15, 31, 82, 0.25)" }}>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b" style={{ borderColor: "var(--line)" }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--accent-soft)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-syne)" }}>AI Copilot</span>
            </div>
            <div className="space-y-3">
              <div className="ml-auto max-w-[85%] text-xs rounded-lg rounded-tr-sm px-3 py-2" style={{ background: "var(--accent)", color: "white" }}>
                Which 9th-graders missed 4+ days this term?
              </div>
              <div className="max-w-[90%] text-xs rounded-lg rounded-tl-sm px-3 py-2" style={{ background: "var(--soft)", color: "var(--ink)" }}>
                6 students across Batches 9-A and 9-B. Aarav Shah leads with 7 absences — mostly
                Mondays. Want the full list?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Section */}
      <section id="roles" className="px-6 py-24 border-y" style={{ background: "var(--soft)", borderColor: "var(--line)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="mono text-[11px]" style={{ color: "var(--brass)" }}>BUILT FOR TWO ROLES</span>
            <h2 className="text-2xl font-bold tracking-tight mt-2" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>
              Oversight for one, speed for the other
            </h2>
            <p className="text-xs mt-2 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
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
              <div key={item.role} className="card p-6 bg-white">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="badge-dark">{item.badge}</span>
                <h3 className="text-base font-semibold mt-3" style={{ fontFamily: "var(--font-syne)" }}>{item.role}</h3>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>{item.description}</p>
                <ul className="mt-4 space-y-2">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--faint)" }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App download section */}
      <section id="app" className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_auto] gap-14 items-center">
          <div>
            <span className="mono text-[11px]" style={{ color: "var(--brass)" }}>ON YOUR PHONE</span>
            <h2 className="text-2xl font-bold tracking-tight mt-2 leading-snug" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>
              Take attendance from the
              <br />
              back of the classroom
            </h2>
            <p className="mt-4 text-sm leading-relaxed max-w-md" style={{ color: "var(--muted)" }}>
              The Gurukul app mirrors the desktop grid, works offline during a scan or a power cut,
              and syncs the moment you're back online. Built for teachers on the move and
              administrators checking in between periods.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/mobile-app" className="btn-primary">
                Choose your app
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={SCHOOL_APP_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-white transition-all"
                style={{ background: "var(--ink-deep)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Smartphone className="w-4 h-4" />
                <span className="leading-tight text-left">
                  <span className="block text-[9px] opacity-70">Gurukul School</span>
                  <span className="block text-xs font-semibold">Install school app</span>
                </span>
              </a>
              <a
                href={PARENT_APP_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-white transition-all"
                style={{ background: "var(--saffron)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Smartphone className="w-4 h-4" />
                <span className="leading-tight text-left">
                  <span className="block text-[9px] opacity-70">Gurukul Parents</span>
                  <span className="block text-xs font-semibold">Install parent app</span>
                </span>
              </a>

              <div className="flex items-center gap-2 pl-2 text-[11px]" style={{ color: "var(--muted)" }}>
                <div className="flex" style={{ color: "var(--brass)" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3" fill="var(--brass)" strokeWidth={0} />
                  ))}
                </div>
                <span>Rated by faculty, not marketers</span>
              </div>
            </div>
          </div>

          {/* QR + phone mock */}
          <div className="flex items-center gap-6 justify-self-center">
            <div className="card p-3 flex items-center justify-center" style={{ width: 92, height: 92 }}>
              <QrCode className="w-14 h-14" style={{ color: "var(--ink)" }} />
            </div>
            <div className="w-40 h-64 rounded-[1.75rem] p-2" style={{ background: "var(--ink-deep)", boxShadow: "0 24px 48px -18px rgba(15,31,82,0.4)" }}>
              <div className="w-full h-full rounded-[1.25rem] bg-white p-3 flex flex-col">
                <span className="text-[9px] font-semibold" style={{ fontFamily: "var(--font-syne)" }}>Batch 9-B</span>
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-sm"
                      style={{ background: [3, 11].includes(i) ? "#FDEBEC" : "var(--accent-soft)" }}
                    />
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-center rounded-lg py-1.5 text-[8px] font-semibold text-white" style={{ background: "var(--accent)" }}>
                  Mark & sync
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto rounded-2xl px-10 py-14 text-center relative overflow-hidden" style={{ background: "var(--ink-deep)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 20%, rgba(30,58,138,0.5), transparent 55%)" }} />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
              Your next admission season, verified from day one
            </h2>
            <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Set up your first batch and scan your first form in under ten minutes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-7 text-xs font-medium px-5 py-2.5 rounded-lg transition-all"
              style={{ background: "white", color: "var(--ink-deep)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span>Sign in to system</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6 bg-white" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-[1.3fr_1fr_1fr_1fr] gap-8 pb-10 mb-8 border-b" style={{ borderColor: "var(--line)" }}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[9px]" style={{ background: "var(--accent)" }}>
                G
              </div>
              <span className="font-medium" style={{ fontFamily: "var(--font-syne)" }}>Gurukul</span>
            </div>
            <p className="text-xs mt-3 max-w-[220px] leading-relaxed" style={{ color: "var(--muted)" }}>
              The AI-first operating system for schools — attendance, admissions, and timetables, verified.
            </p>
          </div>
          {[
            { heading: "Product", links: ["Features", "How it works", "AI Copilot", "Get the app"] },
            { heading: "Roles", links: ["Administrator", "Teacher"] },
            { heading: "Support", links: ["Sign in", "Contact", "Status"] },
          ].map((col) => (
            <div key={col.heading}>
              <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-syne)" }}>{col.heading}</span>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-xs transition-colors" style={{ color: "var(--muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-3" style={{ color: "var(--faint)" }}>
          <p>&copy; 2026 Gurukul Systems. All rights reserved.</p>
          <p className="mono text-[10px]">EVERY RECORD, VERIFIED.</p>
        </div>
      </footer>
    </div>
  );
}
