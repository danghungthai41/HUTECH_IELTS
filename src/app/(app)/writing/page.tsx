export const dynamic = "force-dynamic";

import Link from "next/link";
import { PenLine, Clock, BarChart3, Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { writingTests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mockTests = [
  {
    id: "1",
    title: "Describe a Bar Chart - City Population",
    task: "task1" as const,
    prompt: "The chart below shows the population of three cities from 2000 to 2020.",
    imageUrl: null,
    timeMinutes: 20,
    difficulty: "medium" as const,
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Technology and Society",
    task: "task2" as const,
    prompt: "Some people believe that technology has made our lives more complicated. To what extent do you agree or disagree?",
    imageUrl: null,
    timeMinutes: 40,
    difficulty: "hard" as const,
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Line Graph - Global Temperature",
    task: "task1" as const,
    prompt: "The graph below shows the global average temperature from 1960 to 2020.",
    imageUrl: null,
    timeMinutes: 20,
    difficulty: "easy" as const,
    isPublished: true,
    createdAt: new Date(),
  },
];

async function getTests() {
  try {
    const res = await db
      .select()
      .from(writingTests)
      .where(eq(writingTests.isPublished, true));
    return res.length > 0 ? res : mockTests;
  } catch {
    return mockTests;
  }
}

const difficultyColor = {
  easy: "success" as const,
  medium: "warning" as const,
  hard: "destructive" as const,
};

export default async function WritingPage() {
  const tests = await getTests();
  const task1 = tests.filter((t: any) => t.task === "task1");
  const task2 = tests.filter((t: any) => t.task === "task2");

  return (
    <div>
      <Header title="IELTS Writing" subtitle="Luyện tập Writing Task 1 & Task 2 với AI chấm điểm" />
      <div className="p-6 space-y-6">
        {/* Info */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Clock, label: "Task 1", val: "20 phút", sub: "Minimum 150 words" },
            { icon: PenLine, label: "Task 2", val: "40 phút", sub: "Minimum 250 words" },
            { icon: BarChart3, label: "AI chấm điểm", val: "4 tiêu chí", sub: "Theo chuẩn IELTS" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <item.icon className="w-8 h-8 text-violet-500 flex-shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                  <div className="font-semibold">{item.val}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task 1 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Task 1 — Mô tả biểu đồ / sơ đồ
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {task1.map((t: any) => (
              <Link key={t.id} href={`/writing/${t.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary">Task 1</Badge>
                      <Badge variant={difficultyColor[t.difficulty as keyof typeof difficultyColor]}>
                        {t.difficulty === "easy" ? "Dễ" : t.difficulty === "medium" ? "Trung bình" : "Khó"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{t.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{t.prompt}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {t.timeMinutes} phút
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Task 2 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Task 2 — Bài luận dạng ý kiến
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {task2.map((t: any) => (
              <Link key={t.id} href={`/writing/${t.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="default">Task 2</Badge>
                      <Badge variant={difficultyColor[t.difficulty as keyof typeof difficultyColor]}>
                        {t.difficulty === "easy" ? "Dễ" : t.difficulty === "medium" ? "Trung bình" : "Khó"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{t.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{t.prompt}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {t.timeMinutes} phút
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
