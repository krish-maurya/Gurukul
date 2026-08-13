"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession, UserRole, MOCK_USERS } from "./index";

interface AuthContextType {
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  login: (role: UserRole, customEmail?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "gurukul_auth_user_role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEY) as UserRole | null;
      if (savedRole && MOCK_USERS[savedRole]) {
        setCurrentUser(MOCK_USERS[savedRole]);
      } else {
        // Default unauthenticated on initial load so landing page is shown
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (role: UserRole, customEmail?: string) => {
    const baseUser = MOCK_USERS[role] || MOCK_USERS.ADMIN;
    const userSession: UserSession = customEmail
      ? { ...baseUser, email: customEmail }
      : baseUser;

    setCurrentUser(userSession);
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const switchRole = (role: UserRole) => {
    login(role);
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
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        isAdmin,
        isTeacher,
      }}
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
