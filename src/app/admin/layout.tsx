import Link from "next/link";
import { LayoutDashboard, PenLine, Mic, BookOpen, Headphones, GraduationCap } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/writing", label: "Writing", icon: PenLine },
  { href: "/admin/speaking", label: "Speaking", icon: Mic },
  { href: "/admin/reading", label: "Reading", icon: BookOpen },
  { href: "/admin/listening", label: "Listening", icon: Headphones },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <GraduationCap className="w-6 h-6 text-blue-400" />
          <span className="font-bold">hutechIELTShacker Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <Link href="/dashboard" className="text-xs text-white/50 hover:text-white">
            ← Về trang học
          </Link>
        </div>
      </aside>
      <main className="flex-1 ml-56">{children}</main>
    </div>
  );
}
