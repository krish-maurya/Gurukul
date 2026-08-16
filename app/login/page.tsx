"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, ChevronLeft, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";

type LoginTab = "ADMIN" | "TEACHER";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState<LoginTab>("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error || "Login failed");
      return;
    }
    // Teachers land on the task picker, admins on the dashboard
    const me = await fetch("/api/auth/me").then((r) => r.json()).catch(() => null);
    if (me?.user?.role === "TEACHER") {
      router.push("/welcome");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  const inputCls =
    "w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-gurukul-dark placeholder:text-slate-400 focus:bg-white focus:border-gurukul-tech focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Back */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-gurukul-dark mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gurukul-dark text-white flex items-center justify-center shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gurukul-dark tracking-tight">Welcome back</h1>
          <p className="text-xs text-slate-500 mt-1.5">Sign in to your GURUKUL workspace</p>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setTab("ADMIN")}
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
              tab === "ADMIN" ? "bg-white text-gurukul-dark shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("TEACHER")}
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
              tab === "TEACHER" ? "bg-white text-gurukul-dark shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tab === "ADMIN" ? "Admin email" : "Teacher email"}
            className={inputCls}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gurukul-dark transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gurukul-dark hover:bg-gurukul-dark/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          {tab === "TEACHER"
            ? "New here? Open the invitation link shared by your administrator to set up your account."
            : "Access is managed by your school. Contact IT if you can't sign in."}
        </p>
      </div>
    </div>
  );
}
