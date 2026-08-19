"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  HeartHandshake,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const benefits = [
  { icon: BellRing, title: "Stay in the loop", text: "Important updates reach the people who need them." },
  { icon: CalendarDays, title: "Made for school rhythms", text: "Timetables, attendance, and dates are always within reach." },
  { icon: ShieldCheck, title: "Private by design", text: "Role-based access keeps every family’s information protected." },
];

const staffFeatures = [
  "Take and sync attendance from any classroom",
  "View your timetable, substitutions, and notices",
  "Keep student records and follow-ups close at hand",
];

const parentFeatures = [
  "Track attendance, homework, and school updates",
  "See fee reminders and important dates in one place",
  "Stay connected to your child's learning journey",
];

const PARENT_APP_DOWNLOAD_URL =
  "https://expo.dev/accounts/snehp.03/projects/gurukul-parent/builds/31176960-38d3-4705-a483-50a8419609ec";

function StoreButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--ink-deep)" }}
      aria-label={`${label} app download coming soon`}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export default function MobileAppPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-gurukul-ink">
      <style jsx global>{`
        .mobile-app-page {
          --brass: #a9803f;
          --ink-deep: #0c1230;
          --saffron: #e87900;
          --saffron-text: #ad5700;
          --saffron-soft: #fff3df;
        }
        @keyframes mobile-app-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .mobile-app-float { animation: mobile-app-float 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .mobile-app-float { animation: none; } }
      `}</style>

      <div className="mobile-app-page">
        <header className="border-b bg-white/90 backdrop-blur" style={{ borderColor: "var(--line)" }}>
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href="/landing" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold tracking-wider text-white" style={{ background: "var(--accent)" }}>G</span>
              <span className="text-sm font-semibold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Gurukul</span>
            </Link>
            <Link href="/landing" className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </Link>
          </div>
        </header>

        <section className="relative px-6 pb-16 pt-16 sm:pt-20">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2" style={{ background: "radial-gradient(circle at 50% 25%, var(--accent-glow), transparent 62%)" }} />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent-text)", border: "1px solid rgba(30, 58, 138, 0.18)" }}>
              <Smartphone className="h-3 w-3" /> GURUKUL ON MOBILE
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>
              The right school day,<br /><span style={{ color: "var(--accent)" }}>in the right hands.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: "var(--muted)" }}>
              Choose the Gurukul app designed for your role. Staff can run the school day from anywhere; parents can stay close to what matters at school.
            </p>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            <article className="group relative overflow-hidden rounded-2xl border bg-white p-6 sm:p-8" style={{ borderColor: "var(--line)", boxShadow: "0 16px 40px -28px rgba(15,31,82,.35)" }}>
              <div className="absolute right-0 top-0 h-44 w-44 rounded-bl-full opacity-70" style={{ background: "var(--accent-soft)" }} />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-medium tracking-[0.14em]" style={{ color: "var(--brass)" }}>FOR ADMINISTRATORS & TEACHERS</span>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>Gurukul Staff</h2>
                  </div>
                  <div className="mobile-app-float flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--accent)", color: "white" }}><ClipboardCheck className="h-5 w-5" /></div>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Your command centre for attendance, schedules, student context, and the everyday decisions that keep a school moving.</p>
                <ul className="mt-6 space-y-3">
                  {staffFeatures.map((feature) => <li key={feature} className="flex gap-2.5 text-xs leading-relaxed" style={{ color: "var(--muted)" }}><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent)" }} />{feature}</li>)}
                </ul>
                <div className="mt-7 flex flex-wrap gap-2"><StoreButton label="Install School App" /></div>
                <p className="mt-3 text-[11px]" style={{ color: "var(--faint)" }}>For authorised school administrators and teachers.</p>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border p-6 sm:p-8" style={{ background: "var(--soft)", borderColor: "var(--line)", boxShadow: "0 16px 40px -28px rgba(15,31,82,.35)" }}>
              <div className="absolute bottom-0 right-0 h-44 w-44 rounded-tl-full" style={{ background: "var(--saffron-soft)" }} />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-medium tracking-[0.14em]" style={{ color: "var(--saffron-text)" }}>FOR PARENTS & GUARDIANS</span>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-syne)", color: "var(--ink-deep)" }}>Gurukul Parents</h2>
                  </div>
                  <div className="mobile-app-float flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--saffron)", color: "white", animationDelay: "-2s" }}><HeartHandshake className="h-5 w-5" /></div>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: "var(--muted)" }}>A calm, clear view of your child’s school life—built to inform you without adding to the noise of the day.</p>
                <ul className="mt-6 space-y-3">
                  {parentFeatures.map((feature) => <li key={feature} className="flex gap-2.5 text-xs leading-relaxed" style={{ color: "var(--muted)" }}><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--saffron-text)" }} />{feature}</li>)}
                </ul>
                <div className="mt-7 flex flex-wrap gap-2">
                  <a
                    href={PARENT_APP_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: "var(--saffron)" }}
                    aria-label="Install the Gurukul Parents app"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Install Parent App
                  </a>
                </div>
                <p className="mt-3 text-[11px]" style={{ color: "var(--faint)" }}>Use the mobile number registered with your school to sign in.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="border-y px-6 py-12" style={{ background: "var(--soft)", borderColor: "var(--line)" }}>
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Icon className="h-4 w-4" /></div><div><h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-syne)" }}>{title}</h3><p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{text}</p></div></div>
            ))}
          </div>
        </section>

        <footer className="px-6 py-8"><div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs sm:flex-row" style={{ color: "var(--faint)" }}><span>© 2026 Gurukul Systems. All rights reserved.</span><Link href="/login" className="inline-flex items-center gap-1.5 font-medium" style={{ color: "var(--accent-text)" }}>Sign in to Gurukul <ArrowRight className="h-3.5 w-3.5" /></Link></div></footer>
      </div>
    </main>
  );
}
