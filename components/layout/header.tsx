"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ShieldCheck, UserCheck, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";
import { UserRole } from "@/lib/auth";

export function Header() {
  const router = useRouter();
  const { currentUser, switchRole, logout, isAdmin } = useAuth();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push("/landing");
  };

  return (
    <header className="h-16 bg-white border-b border-gurukul-gray px-6 flex items-center justify-between sticky top-0 z-20 shadow-subtle">
      {/* Search Bar */}
      <div className="relative w-64 sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search students, staff, timetables..."
          className="w-full bg-slate-50 border border-gurukul-gray rounded-lg pl-9 pr-4 py-1.5 text-xs text-gurukul-dark placeholder:text-slate-400 focus:outline-none focus:border-gurukul-tech transition-colors"
        />
      </div>

      {/* Toolbar & Active Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Active Role Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-gurukul-gray">
          <span className="text-[10px] font-semibold text-slate-500 uppercase px-2 hidden sm:inline">
            Role:
          </span>
          <button
            onClick={() => switchRole("ADMIN")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              currentUser.role === "ADMIN"
                ? "bg-gurukul-dark text-white shadow-xs"
                : "text-slate-600 hover:text-gurukul-dark hover:bg-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gurukul-ocean" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => switchRole("TEACHER")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              currentUser.role === "TEACHER"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-gurukul-dark hover:bg-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Teacher</span>
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-gurukul-dark transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gurukul-tech border border-white" />
        </button>

        {/* Current User Profile & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-gurukul-gray">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-gurukul-dark leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{currentUser.department}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gurukul-tech/10 border border-gurukul-tech/20 flex items-center justify-center font-bold text-xs text-gurukul-tech">
            {currentUser.name.charAt(0)}
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
