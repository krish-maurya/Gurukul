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
        window.location.href = "/welcome"; // full reload so session context picks up the cookie
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gurukul-white flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gurukul-dark text-white flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gurukul-dark tracking-tight">Join GURUKUL</h1>
          <p className="text-xs text-gurukul-ocean mt-1">Activate your staff account</p>
        </div>

        <div className="card p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="page-loader-spinner" />
            </div>
          ) : loadError ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-gurukul-highlight border border-neutral-200 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5 text-gurukul-ocean" />
              </div>
              <p className="text-sm font-semibold text-gurukul-dark">{loadError}</p>
              <p className="text-xs text-gurukul-ocean mt-2">Ask your administrator for a new invitation link.</p>
            </div>
          ) : invite ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gurukul-highlight border border-neutral-200/80 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 text-gurukul-dark font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Invitation verified</span>
                </div>
                <p className="text-gurukul-ocean"><strong className="text-gurukul-dark">{invite.name}</strong> · {invite.email}</p>
                <p className="text-gurukul-muted">{invite.department || invite.role}</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-gurukul-dark bg-gurukul-highlight border border-neutral-200 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gurukul-dark mb-1.5 block">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gurukul-muted" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gurukul-dark mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gurukul-muted" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="input pl-9"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
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
