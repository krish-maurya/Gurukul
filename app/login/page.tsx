"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gurukul-dark flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gurukul-tech/20 text-gurukul-tech flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">GURUKUL</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to your school workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gurukul.edu"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center pt-1">
            Teachers: use the invitation link shared by your administrator to set up your account.
          </p>
        </form>
      </div>
    </div>
  );
}
