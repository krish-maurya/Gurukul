"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth/session-context";
import { MobileNavigation, Sidebar } from "./sidebar";
import { Header } from "./header";
import { ChatDrawer } from "@/components/copilot/chat-drawer";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isTeacher } = useAuth();
  const [shellReady, setShellReady] = useState(false);

  const isPublicPage = pathname === "/login" || pathname === "/landing" || pathname.startsWith("/p/") || pathname.startsWith("/invite/");
  const isFocusAttendance = pathname === "/attendance/take";
  const isTeacherRestrictedPage = isTeacher && (pathname === "/staff" || pathname.startsWith("/staff/"));

  useEffect(() => {
    if (isTeacherRestrictedPage) router.replace("/students");
  }, [isTeacherRestrictedPage, router]);

  // Coordinate entrance: delay shell visibility by one frame so the
  // layout paints completely before the transition begins.
  useEffect(() => {
    if (isPublicPage || !isAuthenticated) {
      setShellReady(true);
      return;
    }
    // Use requestAnimationFrame to ensure the DOM tree is fully painted,
    // then trigger the entrance transition so everything appears together.
    const raf = requestAnimationFrame(() => {
      setShellReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [isAuthenticated, isPublicPage]);

  if (isPublicPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-gurukul-dark font-sans">
        {children}
        {!isFocusAttendance && <ChatDrawer />}
      </div>
    );
  }

  if (isTeacherRestrictedPage) {
    return null;
  }

  // Teacher focus mode — attendance only, no sidebar/header/AI
  if (isFocusAttendance) {
    return (
      <div className="min-h-screen bg-gurukul-white text-gurukul-dark antialiased">
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen bg-gurukul-white text-gurukul-dark antialiased shell-entrance ${shellReady ? "shell-entered" : ""}`}
    >
      <Sidebar />
      <div className="flex-1 flex min-w-0 flex-col">
        <Header />
        <MobileNavigation />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
      </div>
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

