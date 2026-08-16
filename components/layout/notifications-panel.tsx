"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, FileText, CalendarClock, UserPlus2, UserMinus, Inbox, RefreshCw, MessagesSquare } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "DOCUMENT" | "PROXY" | "ADMISSION" | "LEAVE" | "PARENT_MSG";
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

const TYPE_META: Record<NotificationItem["type"], { icon: React.ElementType; cls: string; label: string }> = {
  DOCUMENT: { icon: FileText, cls: "bg-neutral-100 text-neutral-600", label: "Documents" },
  PROXY: { icon: CalendarClock, cls: "bg-neutral-100 text-neutral-600", label: "Coverage" },
  ADMISSION: { icon: UserPlus2, cls: "bg-neutral-100 text-neutral-600", label: "Admissions" },
  LEAVE: { icon: UserMinus, cls: "bg-neutral-100 text-neutral-600", label: "Leave" },
  PARENT_MSG: { icon: MessagesSquare, cls: "bg-violet-100 text-violet-700", label: "Parents" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsBell() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const openItem = (item: NotificationItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); load(); }}
        className="relative p-1.5 rounded-md text-neutral-400 hover:text-gurukul-dark hover:bg-neutral-100 transition-colors"
        aria-label={`Notifications${items.length ? ` (${items.length})` : ""}`}
      >
        <Bell className="w-4 h-4" />
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 rounded-full bg-gurukul-dark text-white text-[8px] font-bold flex items-center justify-center">
            {items.length > 99 ? "99+" : items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-white border-l border-neutral-200 shadow-modal flex flex-col animate-[notifSlide_.2s_ease-out]">
            <style>{`@keyframes notifSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gurukul-dark">Notifications</h2>
              <div className="flex items-center gap-1">
                <button onClick={load} className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors" aria-label="Refresh">
                  <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors" aria-label="Close">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <Inbox className="w-8 h-8 text-neutral-200 mb-2" />
                  <p className="text-xs font-medium text-neutral-500">All caught up</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">No notifications.</p>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {items.map((item) => {
                    const meta = TYPE_META[item.type];
                    const Icon = meta.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => openItem(item)}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors flex gap-2.5"
                        >
                          <div className={`w-7 h-7 rounded-lg ${meta.cls} flex items-center justify-center shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-medium text-gurukul-dark">{item.title}</p>
                              <span className="text-[9px] text-neutral-400 shrink-0">{timeAgo(item.createdAt)}</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.detail}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
