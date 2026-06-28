"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTimer } from "@/hooks/useTimer";
import { formatTime } from "@/lib/utils";

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
}

interface ReadingData {
  id: string;
  title: string;
  passage: string;
  timeMinutes: number;
  questions: Question[];
}

function isCorrect(answer: string, correct: string | string[]): boolean {
  const normalise = (s: string) => s.trim().toLowerCase();
  if (Array.isArray(correct)) return correct.some((c) => normalise(c) === normalise(answer));
  return normalise(correct) === normalise(answer);
}

const typeLabel: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  multiple_answers: "Multiple Answers",
  short_answer: "Short Answer",
  true_false_not_given: "True / False / Not Given",
  matching: "Matching",
  fill_blank: "Fill in the Blank",
};

export function ReadingTest({ data }: { data: ReadingData }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbScore, setDbScore] = useState<number | null>(null);
  const [dbTotal, setDbTotal] = useState<number | null>(null);

  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, string>>({});

  async function getAiHelp(qId: string, questionText: string, correctAnswer: string | string[]) {
    if (aiLoading[qId]) return;
    setAiLoading((prev) => ({ ...prev, [qId]: true }));
    
    const correctVal = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
    const studentAnswer = answers[qId] || "";
    const mode = submitted ? "explain" : "hint";

    try {
      const res = await fetch("/api/reading/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: data.passage,
          question: questionText,
          studentAnswer,
          correctAnswer: correctVal,
          mode,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const resData = await res.json();
      setAiResults((prev) => ({ ...prev, [qId]: resData.result }));
    } catch {
      alert("Không thể kết nối với AI hỗ trợ lúc này.");
    }
    setAiLoading((prev) => ({ ...prev, [qId]: false }));
  }

  const { secondsLeft, start, pause } = useTimer(data.timeMinutes * 60, () => handleFinish());

  function handleStart() {
    setStarted(true);
    start();
  }

  function setAnswer(qId: string, value: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  async function handleFinish() {
    if (submitted || saving) return;
    setSaving(true);
    pause();

    try {
      const res = await fetch("/api/reading/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passageId: data.id,
          answers,
        }),
      });
      const resData = await res.json();
      setDbScore(resData.score);
      setDbTotal(resData.total);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      const localScore = data.questions.filter((q) => isCorrect(answers[q.id] ?? "", q.correctAnswer)).length;
      setDbScore(localScore);
      setDbTotal(data.questions.length);
      setSubmitted(true);
    }
    setSaving(false);
  }

  const score = dbScore !== null ? dbScore : 0;
  const total = dbTotal !== null ? dbTotal : data.questions.length;

  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-xl font-bold">{data.title}</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {data.timeMinutes} phút</div>
              <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {data.questions.length} câu hỏi</div>
            </div>
            <Button onClick={handleStart} className="w-full" size="lg">Bắt đầu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Passage */}
      <div className="w-1/2 border-r overflow-y-auto p-6 bg-gray-50">
        <h2 className="font-bold text-lg mb-4">{data.title}</h2>
        <p className="text-sm leading-8 whitespace-pre-line">{data.passage}</p>
      </div>

      {/* Questions */}
      <div className="w-1/2 flex flex-col overflow-hidden">
        {/* Timer bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <span className="font-medium text-sm">{data.questions.length} câu hỏi</span>
          <div className="flex items-center gap-2 font-mono font-bold text-lg">
            <Clock className="w-5 h-5" /> {formatTime(secondsLeft)}
          </div>
          {!submitted && (
            <Button onClick={handleFinish} disabled={saving} size="sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Nộp bài
            </Button>
          )}
          {submitted && (
            <Badge variant={score >= total * 0.7 ? "success" : "destructive"}>
              {score}/{total} đúng
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {submitted && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold">{score}/{total}</div>
              <div className="text-muted-foreground text-sm mt-1">
                {Math.round((score / total) * 100)}% đúng · Band ~{(score / total * 9).toFixed(1)}
              </div>
            </div>
          )}

          {data.questions.map((q, idx) => {
            const answered = answers[q.id];
            const correct = submitted ? isCorrect(answered ?? "", q.correctAnswer) : null;
            const correctVal = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;

            return (
              <div key={q.id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-muted text-xs flex items-center justify-center flex-shrink-0 font-semibold mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-muted-foreground">{typeLabel[q.type]}</span>
                      {submitted && (correct ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ))}
                      
                      {/* AI Support Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-primary hover:text-primary hover:bg-primary/5 px-2.5 ml-auto flex items-center gap-1 border border-primary/10 rounded-full"
                        onClick={() => getAiHelp(q.id, q.question, q.correctAnswer)}
                        disabled={aiLoading[q.id]}
                      >
                        {aiLoading[q.id] ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full overflow-hidden p-0.5 bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <img src="/imgs/hutech.webp" alt="Hutech AI" className="w-full h-full object-contain rounded-full" />
                          </div>
                        )}
                        {submitted ? "AI Giải thích" : "AI Gợi ý"}
                      </Button>
                    </div>
                    <p className="font-medium text-sm">{q.question}</p>
                  </div>
                </div>

                {/* Options */}
                {q.options ? (
                  <div className="pl-8 space-y-2">
                    {q.options.map((opt) => {
                      const optVal = opt.startsWith("A. ") || opt.startsWith("B. ") || opt.startsWith("C. ") || opt.startsWith("D. ")
                        ? opt[0]
                        : opt;
                      const selected = answers[q.id] === optVal;
                      const isCorrectOpt = correctVal === optVal;
                      let cls = "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ";
                      if (!submitted) {
                        cls += selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50";
                      } else {
                        if (isCorrectOpt) cls += "border-emerald-500 bg-emerald-50 text-emerald-800";
                        else if (selected && !isCorrectOpt) cls += "border-red-400 bg-red-50 text-red-800";
                        else cls += "border-border";
                      }
                      return (
                        <div key={opt} className={cls} onClick={() => setAnswer(q.id, optVal)}>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pl-8">
                    <input
                      type="text"
                      disabled={submitted}
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Nhập câu trả lời..."
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 ${
                        submitted
                          ? correct
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-red-400 bg-red-50"
                          : "border-input bg-background"
                      }`}
                    />
                    {submitted && !correct && (
                      <p className="text-xs text-emerald-700 mt-1">✓ Đáp án đúng: <strong>{correctVal}</strong></p>
                    )}
                  </div>
                )}

                {/* AI Explanation / Hint Box */}
                {aiResults[q.id] && (
                  <div className="pl-8 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="bg-blue-50/50 border border-blue-100/30 rounded-xl p-3.5 text-xs leading-relaxed text-slate-700">
                      <div className="font-bold text-[10px] text-blue-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded-full overflow-hidden p-0.5 bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <img src="/imgs/hutech.webp" alt="Hutech AI" className="w-full h-full object-contain rounded-full" />
                        </div>
                        {submitted ? "Lời Giải thích từ AI:" : "Gợi ý từ AI:"}
                      </div>
                      <p>{aiResults[q.id]}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
