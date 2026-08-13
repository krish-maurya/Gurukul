"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  FileText, 
  Calendar, 
  Users, 
  ShieldAlert, 
  LayoutDashboard, 
  GraduationCap, 
  UserCheck,
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Command Center", href: "/", icon: LayoutDashboard },
  { name: "Grid Attendance", href: "/attendance", icon: UserCheck, badge: "Roll 1-40" },
  { name: "Document Intelligence", href: "/documents", icon: FileText, badge: "OCR AI" },
  { name: "Timetable Optimizer", href: "/timetable", icon: Calendar, badge: "Engine" },
  { name: "Student Registry", href: "/students", icon: GraduationCap },
  { name: "Faculty & Staff", href: "/staff", icon: Users },
  { name: "Audit & Access (RBAC)", href: "/admin/roles", icon: ShieldAlert, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <aside className="w-64 bg-gurukul-dark text-white flex flex-col h-screen sticky top-0 border-r border-gurukul-dark select-none z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-gurukul-dark/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gurukul-tech flex items-center justify-center font-bold text-white tracking-wider shadow-sm">
            G
          </div>
          <div>
            <h1 className="font-semibold tracking-tight text-white text-base leading-tight">GURUKUL</h1>
            <p className="text-[11px] text-gurukul-ocean font-medium tracking-wide uppercase">AI School OS</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-gurukul-gray/60 uppercase">
          Core Operations
        </div>
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gurukul-tech text-white shadow-sm"
                  : "text-gurukul-gray hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gurukul-ocean"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-tight ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gurukul-tech/20 text-gurukul-ocean"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status & Active User Info */}
      <div className="p-4 border-t border-gurukul-dark/80 bg-gurukul-dark/50">
        <div className="flex items-center justify-between mb-3 text-xs text-gurukul-gray">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-gurukul-gray">System Online</span>
          </div>
          <span className="text-[10px] text-gurukul-ocean font-mono">v2.0.0</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gurukul-tech text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-gurukul-ocean truncate">{currentUser.role} Access</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/landing");
            }}
            title="Log Out"
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
