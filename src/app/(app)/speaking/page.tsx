export const dynamic = "force-dynamic";

import Link from "next/link";
import { Mic, Clock, Users, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { speakingTests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mockTests = [
  {
    id: "s1",
    title: "Part 1 – Hometown & Daily Life",
    part: "part1" as const,
    questions: ["Where are you from?", "What do you do?", "Do you enjoy living there?"],
    speakingTime: 300,
    difficulty: "easy" as const,
  },
  {
    id: "s2",
    title: "Part 2 – Describe a memorable journey",
    part: "part2" as const,
    questions: ["Describe a memorable journey you have had."],
    cueCard: "You should say:\n• Where you went\n• Who you went with\n• What you did there\n• And explain why it was memorable.",
    speakingTime: 120,
    preparationTime: 60,
    difficulty: "medium" as const,
  },
  {
    id: "s3",
    title: "Part 3 – Technology & Society",
    part: "part3" as const,
    questions: [
      "How has technology changed the way people communicate?",
      "Do you think social media has a positive or negative effect on society?",
      "What do you think the future of technology looks like?",
    ],
    speakingTime: 360,
    difficulty: "hard" as const,
  },
];

async function getTests() {
  try {
    const res = await db
      .select()
      .from(speakingTests)
      .where(eq(speakingTests.isPublished, true));
    return res.length > 0 ? res : mockTests;
  } catch {
    return mockTests;
  }
}

const partLabel: Record<string, string> = {
  part1: "Part 1",
  part2: "Part 2",
  part3: "Part 3",
};
const partDesc: Record<string, string> = {
  part1: "Câu hỏi giới thiệu và cuộc sống hàng ngày",
  part2: "Trình bày dài (Cue Card)",
  part3: "Thảo luận chủ đề nâng cao",
};
const diffColor = { easy: "success" as const, medium: "warning" as const, hard: "destructive" as const };

export default async function SpeakingPage() {
  const testsData = await getTests();

  return (
    <div>
      <Header title="IELTS Speaking" subtitle="Mô phỏng giám khảo IELTS Speaking bằng AI" />
      <div className="p-6 space-y-6">
        {/* Info banner */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Mic, label: "Speech to Text", sub: "Nhận dạng giọng nói tự động" },
            { icon: Users, label: "AI Examiner", sub: "Đọc câu hỏi bằng giọng nói" },
            { icon: Clock, label: "Real-time", sub: "Chấm điểm 4 tiêu chí IELTS" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <item.icon className="w-8 h-8 text-rose-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tests by part */}
        {(["part1", "part2", "part3"] as const).map((part) => {
          const tests = testsData.filter((t: any) => t.part === part);
          return (
            <section key={part}>
              <h2 className="text-lg font-semibold mb-3">
                {partLabel[part]}{" "}
                <span className="text-sm font-normal text-muted-foreground">— {partDesc[part]}</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((t: any) => (
                  <Link key={t.id} href={`/speaking/${t.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary">{partLabel[t.part]}</Badge>
                          <Badge variant={diffColor[t.difficulty as keyof typeof diffColor]}>
                            {t.difficulty === "easy" ? "Dễ" : t.difficulty === "medium" ? "Trung bình" : "Khó"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-2">{t.title}</h3>
                        <div className="space-y-1">
                          {t.questions.slice(0, 2).map((q: any, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground truncate">• {q}</p>
                          ))}
                          {t.questions.length > 2 && (
                            <p className="text-xs text-muted-foreground">• +{t.questions.length - 2} câu hỏi...</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {Math.ceil(t.speakingTime / 60)} phút
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
