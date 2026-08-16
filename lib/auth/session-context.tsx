"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
    refresh().finally(() => setIsLoaded(true));
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
      window.location.href = "/landing";
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";
  const isTeacher = currentUser?.role === "TEACHER";
  const isAuthenticated = !!currentUser;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gurukul-dark flex items-center justify-center text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gurukul-tech animate-ping" />
          <span>Loading GURUKUL Session...</span>
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
