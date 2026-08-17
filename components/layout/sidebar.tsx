"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessagesSquare,
  FileText,
  Calendar,
  Users,
  ShieldAlert,
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/session-context";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  teacherRestricted?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: UserCheck },
  { name: "Documents", href: "/documents", icon: FileText, badge: "OCR" },
  { name: "Timetable", href: "/timetable", icon: Calendar },
  { name: "Students", href: "/students", icon: GraduationCap },
  { name: "Parent Connect", href: "/communications", icon: MessagesSquare },
  { name: "Staff", href: "/staff", icon: Users, teacherRestricted: true },
  { name: "Access Control", href: "/admin/roles", icon: ShieldAlert, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return null;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } hidden bg-white border-r border-neutral-200 text-gurukul-dark md:flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-200`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-neutral-200 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gurukul-dark flex items-center justify-center text-white text-[11px] font-bold tracking-wider">
              G
            </div>
            <div>
              <h1 className="font-semibold text-[13px] tracking-tight text-gurukul-dark leading-none">Gurukul</h1>
              <p className="text-[9px] text-neutral-400 font-medium tracking-wider uppercase mt-0.5">AI School OS</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="w-7 h-7 rounded-lg bg-gurukul-dark flex items-center justify-center text-white text-[11px] font-bold tracking-wider">
              G
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <div className="px-2 pb-2 text-[9px] font-medium tracking-wider text-neutral-400 uppercase">
            Main
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          if (item.teacherRestricted && currentUser.role === "TEACHER") return null;

          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-neutral-100 text-gurukul-dark"
                  : "text-neutral-500 hover:text-gurukul-dark hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-gurukul-dark" : "text-neutral-400"}`} />
                {!collapsed && <span>{item.name}</span>}
              </div>
              {!collapsed && item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                    isActive
                      ? "bg-neutral-200 text-neutral-600"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-200">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded-md text-neutral-400 hover:text-gurukul-dark hover:bg-neutral-100 transition-colors mb-2"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {!collapsed && (
          <>
            <div className="flex items-center justify-between mb-2 text-[10px] text-neutral-400 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Online</span>
              </div>
              <span className="text-neutral-300 font-mono">v2.0</span>
            </div>

            <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/50 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gurukul-dark text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gurukul-dark truncate">{currentUser.name}</p>
                  <p className="text-[9px] text-neutral-400 truncate">{currentUser.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/landing");
                }}
                title="Log Out"
                className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-200 transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </>
        )}

        {collapsed && (
          <button
            onClick={() => {
              logout();
              router.push("/landing");
            }}
            title="Log Out"
            className="w-full flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) return null;

  return (
    <nav aria-label="Main navigation" className="sticky top-14 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur md:hidden">
      <div className="custom-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          if (item.teacherRestricted && currentUser.role === "TEACHER") return null;

          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-gurukul-dark text-white"
                  : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-gurukul-dark"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
