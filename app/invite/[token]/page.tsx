"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { GraduationCap, Lock, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";

interface InviteInfo {
  name: string;
  email: string;
  role: string;
  department?: string;
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/auth/invite/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) setLoadError(data.error || "Invalid invitation");
        else setInvite(data);
      })
      .catch(() => setLoadError("Failed to load invitation"))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/auth/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to activate account");
      } else {
        window.location.href = "/"; // full reload so session context picks up the cookie
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gurukul-dark flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gurukul-tech/20 text-gurukul-tech flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join GURUKUL</h1>
          <p className="text-xs text-slate-400 mt-1">Activate your staff account</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {isLoading ? (
            <p className="text-sm text-slate-500 text-center py-6">Checking invitation...</p>
          ) : loadError ? (
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">{loadError}</p>
              <p className="text-xs text-slate-400 mt-2">Ask your administrator for a new invitation link.</p>
            </div>
          ) : invite ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 text-gurukul-tech font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Invitation verified</span>
                </div>
                <p className="text-slate-600"><strong>{invite.name}</strong> · {invite.email}</p>
                <p className="text-slate-500">{invite.department || invite.role}</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-gurukul-tech focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gurukul-tech hover:bg-gurukul-tech/90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? "Activating..." : "Activate Account & Sign In"}</span>
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
