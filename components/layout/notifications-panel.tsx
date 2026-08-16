"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, FileText, CalendarClock, UserPlus2, UserMinus, Inbox, RefreshCw } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "DOCUMENT" | "PROXY" | "ADMISSION" | "LEAVE";
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

const TYPE_META: Record<NotificationItem["type"], { icon: React.ElementType; cls: string; label: string }> = {
  DOCUMENT: { icon: FileText, cls: "bg-sky-100 text-sky-700", label: "Documents" },
  PROXY: { icon: CalendarClock, cls: "bg-amber-100 text-amber-700", label: "Coverage" },
  ADMISSION: { icon: UserPlus2, cls: "bg-emerald-100 text-emerald-700", label: "Admissions" },
  LEAVE: { icon: UserMinus, cls: "bg-rose-100 text-rose-700", label: "Leave" },
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

/** Bell button with count badge + a right-side slide-in panel. */
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

  // initial + refresh every 60s so the badge stays current
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
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-gurukul-dark transition-colors"
        aria-label={`Notifications${items.length ? ` (${items.length})` : ""}`}
      >
        <Bell className="w-4 h-4" />
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gurukul-tech text-white text-[9px] font-bold flex items-center justify-center border border-white">
            {items.length > 99 ? "99+" : items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div className="absolute inset-0 bg-gurukul-dark/40" onClick={() => setIsOpen(false)} />

          {/* right slide-in panel */}
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-[notificationSlideIn_.24s_cubic-bezier(0.16,1,0.3,1)]">
            <style>{`@keyframes notificationSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

            <div className="px-5 py-4 border-b border-gurukul-gray flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gurukul-dark">Notifications</h2>
                  <p className="text-[10px] text-slate-500">{items.length} item{items.length === 1 ? "" : "s"} need attention</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={load} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors" aria-label="Refresh">
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <Inbox className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-500">All caught up</p>
                  <p className="text-xs text-slate-400 mt-1">Nothing needs your attention right now.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gurukul-gray">
                  {items.map((item) => {
                    const meta = TYPE_META[item.type];
                    const Icon = meta.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => openItem(item)}
                          className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex gap-3"
                        >
                          <div className={`w-8 h-8 rounded-lg ${meta.cls} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-gurukul-dark">{item.title}</p>
                              <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(item.createdAt)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.detail}</p>
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
