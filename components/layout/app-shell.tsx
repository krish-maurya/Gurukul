"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth/session-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ChatDrawer } from "@/components/copilot/chat-drawer";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isTeacher } = useAuth();

  const isPublicPage = pathname === "/login" || pathname === "/landing";
  const isTeacherRestrictedPage = isTeacher && (pathname === "/staff" || pathname.startsWith("/staff/"));

  useEffect(() => {
    if (isTeacherRestrictedPage) router.replace("/students");
  }, [isTeacherRestrictedPage, router]);

  if (isPublicPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gurukul-dark text-white font-sans">
        {children}
        {/* Render LinkedIn-Style Copilot globally across public & app sections */}
        <ChatDrawer />
      </div>
    );
  }

  if (isTeacherRestrictedPage) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-gurukul-dark antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
      {/* Render LinkedIn-Style Copilot floating at bottom right across all app pages */}
      <ChatDrawer />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}
