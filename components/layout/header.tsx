"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";
import { GlobalPersonSearch } from "./global-person-search";
import { NotificationsBell } from "./notifications-panel";

export function Header() {
  const router = useRouter();
  const { currentUser, logout, isAdmin } = useAuth();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <GlobalPersonSearch />

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <div
          className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
            isAdmin
              ? "bg-gurukul-dark text-white"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {isAdmin ? (
            <ShieldCheck className="w-3 h-3" />
          ) : (
            <UserCheck className="w-3 h-3" />
          )}
          <span>{isAdmin ? "Admin" : "Teacher"}</span>
        </div>

        {/* Notifications */}
        <NotificationsBell />

        {/* Current User Profile & Logout */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-neutral-200">
          <div className="text-right hidden md:block">
            <p className="text-[11px] font-medium text-gurukul-dark leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-neutral-400">{currentUser.department}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-[10px] text-gurukul-dark">
            {currentUser.name.charAt(0)}
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
