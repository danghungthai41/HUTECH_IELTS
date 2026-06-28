export const dynamic = "force-dynamic";

import Link from "next/link";
import { Headphones, Clock, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { listeningTests, listeningQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mockTests = [
  {
    id: "l1",
    title: "Section 1 – Booking a Hotel",
    difficulty: "easy" as const,
    timeMinutes: 10,
    questionCount: 5,
    types: ["fill_blank", "multiple_choice"],
  },
  {
    id: "l2",
    title: "Section 2 – Campus Tour",
    difficulty: "medium" as const,
    timeMinutes: 10,
    questionCount: 10,
    types: ["multiple_choice", "matching"],
  },
  {
    id: "l3",
    title: "Section 3 – Academic Discussion",
    difficulty: "hard" as const,
    timeMinutes: 10,
    questionCount: 10,
    types: ["multiple_choice", "fill_blank"],
  },
];

async function getListeningTests() {
  try {
    const tests = await db
      .select()
      .from(listeningTests)
      .where(eq(listeningTests.isPublished, true));
    
    if (tests.length === 0) return mockTests;

    const result = [];
    for (const t of tests) {
      const qs = await db
        .select()
        .from(listeningQuestions)
        .where(eq(listeningQuestions.testId, t.id));
      
      const uniqueTypes = Array.from(new Set(qs.map((q: any) => q.type)));

      result.push({
        id: t.id,
        title: t.title,
        difficulty: t.difficulty,
        timeMinutes: t.timeMinutes,
        questionCount: qs.length,
        types: uniqueTypes as string[],
      });
    }
    return result;
  } catch (error) {
    console.error("Fetch listening tests error:", error);
    return mockTests;
  }
}

const diffColor = { easy: "success" as const, medium: "warning" as const, hard: "destructive" as const };

export default async function ListeningPage() {
  const tests = await getListeningTests();

  return (
    <div>
      <Header title="IELTS Listening" subtitle="Luyện tập với file âm thanh và bộ câu hỏi Listening" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Headphones, label: "File âm thanh thực tế", sub: "Giọng Anh-Mỹ-Úc theo chuẩn IELTS" },
            { icon: Clock, label: "Đếm thời gian", sub: "Hiển thị thời gian làm bài như thi thật" },
            { icon: FileText, label: "Ẩn transcript", sub: "Xem transcript sau khi nộp bài" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <item.icon className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Bài Listening luyện tập</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((t) => (
              <Link key={t.id} href={`/listening/${t.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary">Listening</Badge>
                      <Badge variant={diffColor[t.difficulty as keyof typeof diffColor]}>
                        {t.difficulty === "easy" ? "Dễ" : t.difficulty === "medium" ? "Trung bình" : "Khó"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-3">{t.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {t.types.map((ty) => (
                        <span key={ty} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {ty === "fill_blank" ? "Fill Blank" : ty === "multiple_choice" ? "MCQ" : "Matching"}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.timeMinutes} phút</span>
                      <span>{t.questionCount} câu hỏi</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
