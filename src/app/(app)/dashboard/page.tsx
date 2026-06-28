import Link from "next/link";
import {
  PenLine,
  Mic,
  BookOpen,
  Headphones,
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SkillsGrid } from "./SkillsGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  writingSubmissions,
  speakingSubmissions,
  readingSubmissions,
  listeningSubmissions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";



async function getStats() {
  const user = await getCurrentUser();
  if (!user) {
    return { completed: 0, hours: 0, avgBand: "0.0" };
  }

  try {
    const writingCount = await db
      .select()
      .from(writingSubmissions)
      .where(eq(writingSubmissions.userId, user.id));
    const speakingCount = await db
      .select()
      .from(speakingSubmissions)
      .where(eq(speakingSubmissions.userId, user.id));
    const readingCount = await db
      .select()
      .from(readingSubmissions)
      .where(eq(readingSubmissions.userId, user.id));
    const listeningCount = await db
      .select()
      .from(listeningSubmissions)
      .where(eq(listeningSubmissions.userId, user.id));

    const totalCompleted =
      writingCount.length +
      speakingCount.length +
      readingCount.length +
      listeningCount.length;

    let totalBandScore = 0;
    let bandCount = 0;

    writingCount.forEach((s: any) => {
      const b = parseFloat(s.overallBand || "0");
      if (b > 0) {
        totalBandScore += b;
        bandCount++;
      }
    });

    speakingCount.forEach((s: any) => {
      const b = parseFloat(s.overallBand || "0");
      if (b > 0) {
        totalBandScore += b;
        bandCount++;
      }
    });

    readingCount.forEach((s: any) => {
      const pct = s.score / (s.totalQuestions || 1);
      const b = Math.round(pct * 9 * 2) / 2;
      totalBandScore += b;
      bandCount++;
    });

    listeningCount.forEach((s: any) => {
      const pct = s.score / (s.totalQuestions || 1);
      const b = Math.round(pct * 9 * 2) / 2;
      totalBandScore += b;
      bandCount++;
    });

    const avgBand = bandCount > 0 ? (totalBandScore / bandCount).toFixed(1) : "0.0";
    const hours = Math.ceil(totalCompleted * 0.5);

    return { completed: totalCompleted, hours, avgBand };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { completed: 0, hours: 0, avgBand: "0.0" };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();
  const user = await getCurrentUser();

  const quickStats = [
    { label: "Bài đã làm", value: stats.completed.toString(), icon: Target, color: "text-blue-600" },
    { label: "Giờ luyện tập", value: stats.hours.toString() + "h", icon: Clock, color: "text-violet-600" },
    { label: "Band trung bình", value: stats.avgBand === "0.0" ? "_" : stats.avgBand, icon: TrendingUp, color: "text-emerald-600" },
  ];

  return (
    <div>
      <Header title="Tổng quan" subtitle={`Chào mừng bạn trở lại, ${user?.fullName || "hutechIELTShacker"}!`} />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {quickStats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skills */}
        <SkillsGrid />

        {/* Chat CTA */}
        <Card className="bg-gradient-to-r from-orange-500 via-orange-200 to-orange-50/50 text-slate-800 border border-orange-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">AI IELTS Chat Assistant</h3>
                <p className="text-slate-600 text-sm">
                  Hỏi bất kỳ điều gì về IELTS, ngữ pháp, từ vựng hay chiến lược làm bài.
                </p>
              </div>
            </div>
            <Link href="/chat">
              <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full px-5 shadow-sm">
                Chat ngay <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
