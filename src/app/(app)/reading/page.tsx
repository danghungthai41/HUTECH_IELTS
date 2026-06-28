export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen, Clock, HelpCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { readingPassages, readingQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mockPassages = [
  {
    id: "r1",
    title: "The History of the Internet",
    difficulty: "medium" as const,
    timeMinutes: 20,
    questionCount: 7,
    types: ["multiple_choice", "true_false_not_given", "short_answer"],
  },
  {
    id: "r2",
    title: "Climate Change and Biodiversity",
    difficulty: "hard" as const,
    timeMinutes: 20,
    questionCount: 14,
    types: ["matching", "multiple_answers", "fill_blank"],
  },
  {
    id: "r3",
    title: "Urban Architecture in the 21st Century",
    difficulty: "easy" as const,
    timeMinutes: 20,
    questionCount: 13,
    types: ["multiple_choice", "true_false_not_given"],
  },
];

async function getPassages() {
  try {
    const passages = await db
      .select()
      .from(readingPassages)
      .where(eq(readingPassages.isPublished, true));
    
    if (passages.length === 0) return mockPassages;

    const result = [];
    for (const p of passages) {
      const qs = await db
        .select()
        .from(readingQuestions)
        .where(eq(readingQuestions.passageId, p.id));
      
      const uniqueTypes = Array.from(new Set(qs.map((q: any) => q.type)));

      result.push({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        timeMinutes: p.timeMinutes,
        questionCount: qs.length,
        types: uniqueTypes as string[],
      });
    }
    return result;
  } catch (error) {
    console.error("Fetch reading passages error:", error);
    return mockPassages;
  }
}

const typeLabels: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  multiple_answers: "Multiple Answers",
  short_answer: "Short Answer",
  true_false_not_given: "True/False/Not Given",
  matching: "Matching",
  fill_blank: "Fill in the Blank",
};

const diffColor = { easy: "success" as const, medium: "warning" as const, hard: "destructive" as const };

export default async function ReadingPage() {
  const passages = await getPassages();

  return (
    <div>
      <Header title="IELTS Reading" subtitle="Luyện tập theo dạng bài IELTS Reading thực tế" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: "5 dạng câu hỏi", sub: "MCQ, T/F/NG, Matching, Short Answer, Fill Blank" },
            { icon: Clock, label: "20 phút/bài", sub: "Đồng hồ đếm ngược như thi thật" },
            { icon: HelpCircle, label: "AI giải thích", sub: "Giải thích đáp án chi tiết từng câu" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <item.icon className="w-8 h-8 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Bài đọc luyện tập</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passages.map((p) => (
              <Link key={p.id} href={`/reading/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary">Reading</Badge>
                      <Badge variant={diffColor[p.difficulty as keyof typeof diffColor]}>
                        {p.difficulty === "easy" ? "Dễ" : p.difficulty === "medium" ? "Trung bình" : "Khó"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-3 line-clamp-2">{p.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.types.map((t) => (
                        <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {typeLabels[t]}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.timeMinutes} phút</span>
                      <span>{p.questionCount} câu hỏi</span>
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
