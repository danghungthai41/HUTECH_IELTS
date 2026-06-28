"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  Mic,
  BookOpen,
  Headphones,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";

const navItems = [
  { href: "/dashboard", label: "Dashboard", labelVi: "Tổng quan", icon: LayoutDashboard },
  { href: "/writing", label: "Writing", labelVi: "Writing", icon: PenLine },
  { href: "/speaking", label: "Speaking", labelVi: "Speaking", icon: Mic },
  { href: "/reading", label: "Reading", labelVi: "Reading", icon: BookOpen },
  { href: "/listening", label: "Listening", labelVi: "Listening", icon: Headphones },
  { href: "/chat", label: "AI Chat", labelVi: "AI Chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r border-slate-100 fixed left-0 top-0 z-30 font-sans">
      {/* Top Action Header */}
      <div className="px-4 py-5 border-b border-slate-100 flex gap-2 items-center">
        <Link
          href="/chat"
          onClick={() => {
            // Trigger a refresh if already on chat to reset the page
            if (pathname === "/chat") {
              window.location.reload();
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-sm"
        >
          <span className="text-base font-light leading-none">+</span>
          <span>{lang === "vi" ? "Trò chuyện mới" : "New Chat"}</span>
        </Link>
        <button className="p-2 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-slate-400 hover:text-slate-600 transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-orange-50/80 text-primary font-semibold shadow-sm border-l-2 border-primary rounded-l-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-primary" : "text-slate-400")} />
              <span>{lang === "vi" ? item.labelVi : item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span>{lang === "vi" ? "Quản trị" : "Admin"}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span>{lang === "vi" ? "Đăng xuất" : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
