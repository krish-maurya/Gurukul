"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, ChevronLeft, ShieldCheck, UserCheck, AlertCircle, Loader2 } from "lucide-react";
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
    const me = await fetch("/api/auth/me").then((r) => r.json()).catch(() => null);
    if (me?.user?.role === "TEACHER") {
      router.push("/welcome");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gurukul-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Back */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-gurukul-dark mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gurukul-dark text-white flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-semibold text-gurukul-dark tracking-tight">Welcome back</h1>
          <p className="text-xs text-neutral-400 mt-1">Sign in to your Gurukul workspace</p>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-2 gap-px bg-neutral-200 p-px rounded-lg mb-5">
          <button
            type="button"
            onClick={() => setTab("ADMIN")}
            className={`flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-md transition-all ${
              tab === "ADMIN" ? "bg-white text-gurukul-dark shadow-sm" : "bg-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("TEACHER")}
            className={`flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-md transition-all ${
              tab === "TEACHER" ? "bg-white text-gurukul-dark shadow-sm" : "bg-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
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
            className="input"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-gurukul-dark transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>

        <p className="text-[10px] text-neutral-400 text-center mt-6">
          {tab === "TEACHER"
            ? "New here? Open the invitation link from your administrator."
            : "Access managed by your school. Contact IT for help."}
        </p>
      </div>
    </div>
  );
}
