"use client";

import Link from "next/link";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { lang, changeLanguage } = useLanguage();

  return (
    <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-6 sticky top-0 z-20 font-sans shadow-sm/50">
      <div className="flex items-center gap-3">
        {/* Logo and divider */}
        <Link href="/" className="flex items-center gap-1.5 group mr-3 border-r border-slate-100 pr-3 h-8">
          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 transition-transform group-hover:scale-105">
            <img src="/imgs/hutech.webp" alt="Hutech Logo" className="w-5 h-5 object-contain rounded-full" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-800">
            <span className="text-primary">hutech</span>IELTS<span className="text-primary font-black">hacker</span>
          </span>
        </Link>

        <div>
          <h1 className="text-sm font-bold text-slate-800 leading-none">{title}</h1>
          {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Language toggle flag pills */}
        <div className="flex items-center border border-slate-200/80 rounded-full p-0.5 bg-slate-50 text-xs font-semibold shadow-sm mr-2">
          <button
            onClick={() => changeLanguage("en")}
            className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
              lang === "en"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🇺🇸</span>
            <span>EN</span>
          </button>
          <button
            onClick={() => changeLanguage("vi")}
            className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
              lang === "vi"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🇻🇳</span>
            <span>VI</span>
          </button>
        </div>

        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full w-9 h-9">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full w-9 h-9 border border-slate-100 shadow-sm bg-slate-50">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

