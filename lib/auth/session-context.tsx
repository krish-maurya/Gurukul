"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { UserSession } from "./index";

interface AuthContextType {
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasInitialized = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user ?? null);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    // React Strict Mode reruns effects in development. Keep the initial session
    // request single-shot so an expected signed-out response does not flicker.
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    const sessionCheck = refresh();
    const minimumLoaderDuration = wait(2200);
    const maximumLoaderDuration = wait(2600);

    Promise.all([
      minimumLoaderDuration,
      Promise.race([sessionCheck, maximumLoaderDuration]),
    ]).finally(() => setIsLoaded(true));
  }, [refresh]);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error || "Login failed" };
      }
      setCurrentUser(data.user);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error — please try again" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setCurrentUser(null);
      // A client-side route change preserves the app shell and avoids the white
      // flash caused by a full-document navigation during logout.
      router.replace("/landing");
      router.refresh();
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";
  const isTeacher = currentUser?.role === "TEACHER";
  const isAuthenticated = !!currentUser;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gurukul-white flex items-center justify-center px-6 animate-fade-in" role="status" aria-live="polite">
        <div className="w-full max-w-xs text-center">
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-white shadow-card" />
            <div className="absolute inset-1 rounded-xl bg-gurukul-dark" />
            <span className="relative text-lg font-bold tracking-tight text-white">G</span>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gurukul-white bg-white text-gurukul-dark shadow-subtle">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-gurukul-dark">Preparing your workspace</h1>
          <p className="mt-1.5 text-xs leading-5 text-neutral-400">Checking your secure school session</p>
          <div className="mx-auto mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-neutral-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Just a moment</span>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full w-2/3 rounded-full bg-gurukul-dark animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated, login, logout, refresh, isAdmin, isTeacher }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
