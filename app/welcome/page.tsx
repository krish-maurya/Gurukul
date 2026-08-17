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
      href: "/attendance/take",
      icon: ClipboardCheck,
      title: "Take Attendance",
      description: "Your class and today's date are pre-selected — just mark and submit.",
    },
    {
      href: "/timetable",
      icon: CalendarDays,
      title: "My Timetable",
      description: "See your schedule for the week or add a lecture.",
    },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">
            Good to see you, {firstName}
          </h1>
          <p className="text-xs text-gurukul-ocean mt-1.5">What are you planning to do?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="card card-hover group p-6"
            >
              <div className="w-11 h-11 rounded-lg bg-gurukul-highlight border border-neutral-200/60 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-gurukul-dark" />
              </div>
              <h2 className="text-sm font-semibold text-gurukul-dark mb-1">{title}</h2>
              <p className="text-xs text-gurukul-ocean leading-relaxed mb-4">{description}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gurukul-dark">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-[11px] text-gurukul-muted hover:text-gurukul-dark transition-colors">
            Skip — go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
