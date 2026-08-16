"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, CalendarDays, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";

/**
 * Teacher task picker shown right after login.
 * Two choices only: take attendance, or open my timetable.
 */
export default function WelcomePage() {
  const router = useRouter();
  const { currentUser, isTeacher } = useAuth();

  // Admins don't need this screen
  useEffect(() => {
    if (currentUser && !isTeacher) router.replace("/");
  }, [currentUser, isTeacher, router]);

  if (!currentUser || !isTeacher) return null;

  const firstName = currentUser.name.split(" ").slice(-1)[0];

  const options = [
    {
      href: "/attendance",
      icon: ClipboardCheck,
      title: "Take Attendance",
      description: "Pick your class and period, then mark today's attendance.",
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      href: "/timetable",
      icon: CalendarDays,
      title: "My Timetable",
      description: "See your schedule for the week or add a lecture.",
      accent: "bg-sky-50 text-sky-700 border-sky-200",
      iconBg: "bg-sky-100 text-sky-700",
    },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">
            Good to see you, {firstName}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">What are you planning to do?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map(({ href, icon: Icon, title, description, iconBg }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white rounded-2xl border border-gurukul-gray p-6 shadow-subtle hover:border-gurukul-tech/40 hover:shadow-card transition-all"
            >
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-gurukul-dark mb-1">{title}</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{description}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gurukul-tech">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
            Skip — go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
