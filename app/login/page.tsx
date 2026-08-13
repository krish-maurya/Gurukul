"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Key,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";
import { UserRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [email, setEmail] = useState(
    selectedRole === "ADMIN" ? "admin@gurukul.edu" : "teacher@gurukul.edu"
  );
  const [password, setPassword] = useState("••••••••");

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(role === "ADMIN" ? "admin@gurukul.edu" : "teacher@gurukul.edu");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, email);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gurukul-dark text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-gurukul-tech/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gurukul-ocean/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-8 relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gurukul-tech to-gurukul-ocean flex items-center justify-center font-bold text-white tracking-widest text-lg shadow-lg">
              G
            </div>
            <span className="font-bold text-xl tracking-tight text-white">GURUKUL</span>
          </Link>
          <h2 className="text-xl font-bold text-white">System Access Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Select your role & sign in to GURUKUL AI OS</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange("ADMIN")}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === "ADMIN"
                ? "bg-gurukul-tech text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Role</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("TEACHER")}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === "TEACHER"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher Role</span>
          </button>
        </div>

        {/* One-Click Role Fast Login Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-white">
              {selectedRole === "ADMIN" ? "Dr. Eleanor Vance (Principal)" : "Prof. Alan Turing (Teacher)"}
            </p>
            <p className="text-[11px] text-gurukul-ocean">
              {selectedRole === "ADMIN" ? "Full Access Rights" : "Classroom & Attendance Rights"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              login(selectedRole);
              router.push("/");
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
              selectedRole === "ADMIN"
                ? "bg-gurukul-ocean/20 text-gurukul-ocean hover:bg-gurukul-ocean/30"
                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            }`}
          >
            <span>Instant Login</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Custom Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gurukul-tech transition-colors"
                placeholder="name@gurukul.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gurukul-tech transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              selectedRole === "ADMIN"
                ? "bg-gurukul-tech hover:bg-gurukul-tech/90 shadow-gurukul-tech/25"
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In as {selectedRole}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link href="/landing" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Return to Public Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
