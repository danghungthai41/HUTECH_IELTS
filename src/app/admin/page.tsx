import Link from "next/link";
import { PenLine, Mic, BookOpen, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { href: "/admin/writing", icon: PenLine, label: "Writing Tests", color: "text-violet-500", count: "3 bài" },
  { href: "/admin/speaking", icon: Mic, label: "Speaking Tests", color: "text-rose-500", count: "3 bài" },
  { href: "/admin/reading", icon: BookOpen, label: "Reading Passages", color: "text-amber-500", count: "3 bài" },
  { href: "/admin/listening", icon: Headphones, label: "Listening Tests", color: "text-emerald-500", count: "3 bài" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Quản lý nội dung đề thi 4 kỹ năng IELTS</p>
      <div className="grid grid-cols-2 gap-6">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{s.count} đang hoạt động</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
