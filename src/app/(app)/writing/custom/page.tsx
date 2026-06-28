"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { FileText, ArrowRight } from "lucide-react";

export default function CustomWritingPage() {
  const { lang } = useLanguage();
  const [task, setTask] = useState<"task1" | "task2">("task2");
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [started, setStarted] = useState(false);

  const t = {
    vi: {
      title: "Gửi bài viết tự do",
      subtitle: "AI chấm điểm & nhận xét chi tiết cho đề bài và bài viết tự chọn",
      selectTask: "Chọn dạng bài (Task)",
      promptLabel: "Đề bài / Prompt",
      promptPlaceholder: "Nhập hoặc dán đề bài IELTS tại đây...",
      essayLabel: "Bài viết của bạn",
      essayPlaceholder: "Dán bài viết của bạn tại đây...",
      startGrading: "Bắt đầu chấm điểm",
      fillAll: "Vui lòng nhập đầy đủ đề bài và bài viết!",
    },
    en: {
      title: "Submit Custom Essay",
      subtitle: "AI evaluation & feedback for any prompt and essay of your choice",
      selectTask: "Select Task Type",
      promptLabel: "Topic / Prompt",
      promptPlaceholder: "Type or paste the IELTS writing prompt here...",
      essayLabel: "Your Essay",
      essayPlaceholder: "Paste your written essay here...",
      startGrading: "Start AI Evaluation",
      fillAll: "Please enter both the prompt and your essay!",
    },
  }[lang] || {
    vi: {
      title: "Gửi bài viết tự do",
      subtitle: "AI chấm điểm & nhận xét chi tiết cho đề bài và bài viết tự chọn",
      selectTask: "Chọn dạng bài (Task)",
      promptLabel: "Đề bài / Prompt",
      promptPlaceholder: "Nhập hoặc dán đề bài IELTS tại đây...",
      essayLabel: "Bài viết của bạn",
      essayPlaceholder: "Dán bài viết của bạn tại đây...",
      startGrading: "Bắt đầu chấm điểm",
      fillAll: "Vui lòng nhập đầy đủ đề bài và bài viết!",
    },
    en: {
      title: "Submit Custom Essay",
      subtitle: "AI evaluation & feedback for any prompt and essay of your choice",
      selectTask: "Select Task Type",
      promptLabel: "Topic / Prompt",
      promptPlaceholder: "Type or paste the IELTS writing prompt here...",
      essayLabel: "Your Essay",
      essayPlaceholder: "Paste your written essay here...",
      startGrading: "Start AI Evaluation",
      fillAll: "Please enter both the prompt and your essay!",
    },
  }.vi;

  const handleStart = () => {
    if (!prompt.trim() || !essay.trim()) {
      alert(t.fillAll);
      return;
    }
    setStarted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title={t.title} subtitle={t.subtitle} />
      <div className="p-6 max-w-4xl mx-auto">
        {!started ? (
          <Card className="border-slate-100 shadow-lg shadow-slate-100/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">{t.title}</CardTitle>
                  <CardDescription className="text-slate-500 text-sm mt-0.5">{t.subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-white">
              {/* Task Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">{t.selectTask}</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTask("task1")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold border text-sm transition-all flex items-center justify-center gap-2 ${
                      task === "task1"
                        ? "bg-primary/5 text-primary border-primary/20 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Writing Task 1
                    <Badge variant={task === "task1" ? "default" : "outline"} className="ml-1 text-[10px]">
                      20 mins
                    </Badge>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTask("task2")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold border text-sm transition-all flex items-center justify-center gap-2 ${
                      task === "task2"
                        ? "bg-primary/5 text-primary border-primary/20 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Writing Task 2
                    <Badge variant={task === "task2" ? "default" : "outline"} className="ml-1 text-[10px]">
                      40 mins
                    </Badge>
                  </button>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">{t.promptLabel}</label>
                <Textarea
                  className="min-h-[120px] rounded-xl border-slate-200 focus:border-primary focus:ring-primary text-sm leading-relaxed"
                  placeholder={t.promptPlaceholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Essay Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">{t.essayLabel}</label>
                <Textarea
                  className="min-h-[250px] rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-serif text-base leading-relaxed"
                  placeholder={t.essayPlaceholder}
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                />
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStart}
                className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold py-6 shadow-md shadow-primary/10 flex items-center justify-center gap-2"
              >
                {t.startGrading}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <CustomGradingView task={task} prompt={prompt} essay={essay} onBack={() => setStarted(false)} />
        )}
      </div>
    </div>
  );
}

// Inline component to render the editor directly or grade
interface CustomGradingProps {
  task: "task1" | "task2";
  prompt: string;
  essay: string;
  onBack: () => void;
}

function CustomGradingView({ task, prompt, essay, onBack }: CustomGradingProps) {
  const customTest = {
    id: "custom",
    title: task === "task1" ? "Custom Writing Task 1" : "Custom Writing Task 2",
    task: task,
    prompt: prompt,
    imageUrl: null,
    timeMinutes: task === "task1" ? 20 : 40,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[calc(100vh-140px)]">
      <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm" className="text-slate-600 hover:text-slate-800">
          ← Quay lại sửa bài
        </Button>
        <Badge variant="outline">{task === "task1" ? "Task 1" : "Task 2"}</Badge>
      </div>
      <WritingEditorWrapper test={customTest} initialEssay={essay} />
    </div>
  );
}

// Wrapper to override WritingEditor defaults
import { useRef, useEffect as useReactEffect } from "react";
import { countWords, bandToColor, bandToLabel } from "@/lib/utils";
import type { WritingScoreResult } from "@/types";
import { Loader2, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

function WritingEditorWrapper({ test, initialEssay }: { test: any; initialEssay: string }) {
  const [essay, setEssay] = useState(initialEssay);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<WritingScoreResult | null>(null);
  const [showImproved, setShowImproved] = useState(false);

  const wordCount = countWords(essay);

  // Auto trigger score evaluation on load since the user already completed the writing!
  useReactEffect(() => {
    let active = true;
    async function evaluateEssay() {
      setScoring(true);
      try {
        const res = await fetch("/api/writing/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testId: test.id, task: test.task, prompt: test.prompt, essay }),
        });
        const data = await res.json();
        if (active) setResult(data);
      } catch {
        if (active) {
          setResult({
            taskAchievement: "6.0",
            coherenceCohesion: "6.5",
            lexicalResource: "6.0",
            grammaticalRange: "6.5",
            overallBand: "6.0",
            feedback: "Không thể kết nối đến máy chủ AI chấm điểm. Vui lòng thử lại sau.",
            improvedEssay: "",
          });
        }
      } finally {
        if (active) setScoring(false);
      }
    }
    evaluateEssay();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <div>
          <span className="font-semibold text-sm text-slate-800">{test.title}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground">
            Số từ: <span className="font-semibold">{wordCount}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Prompt panel */}
        <div className="w-2/5 border-r p-6 overflow-y-auto bg-slate-50/50">
          <h3 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wide">
            Đề bài
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700">{test.prompt}</p>
        </div>

        {/* Editor / Results */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
          {scoring ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-slate-500 font-medium">AI đang phân tích và chấm điểm bài viết của bạn...</p>
            </div>
          ) : result ? (
            <>
              {/* Scores */}
              <div>
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Kết quả chấm điểm từ AI
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Task Achievement / Response", value: result.taskAchievement },
                    { label: "Coherence & Cohesion", value: result.coherenceCohesion },
                    { label: "Lexical Resource", value: result.lexicalResource },
                    { label: "Grammatical Range & Accuracy", value: result.grammaticalRange },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">{s.label}</div>
                      <div className={`text-2xl font-extrabold ${bandToColor(parseFloat(s.value))}`}>
                        {s.value}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {bandToLabel(parseFloat(s.value))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-slate-500 text-sm font-semibold mb-1">OVERALL BAND SCORE</div>
                  <div className={`text-5xl font-black ${bandToColor(parseFloat(result.overallBand))}`}>
                    {result.overallBand}
                  </div>
                  <div className="text-sm text-slate-500 mt-1 font-medium">
                    {bandToLabel(parseFloat(result.overallBand))}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800">Nhận xét chi tiết</h3>
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-sm leading-relaxed whitespace-pre-line text-blue-900 font-medium">
                  {result.feedback}
                </div>
              </div>

              {/* Improved Essay */}
              {result.improvedEssay && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowImproved(!showImproved)}
                    className="flex items-center gap-2 font-bold text-slate-800 hover:text-primary transition-colors"
                  >
                    Bài mẫu cải thiện gợi ý (Band 8.0+)
                    {showImproved ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showImproved && (
                    <div className="mt-2 bg-emerald-50/40 rounded-xl p-5 text-sm leading-relaxed whitespace-pre-line text-emerald-900 border border-emerald-100 font-serif">
                      {result.improvedEssay}
                    </div>
                  )}
                </div>
              )}

              {/* Your essay */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800">Bài viết của bạn</h3>
                <div className="bg-slate-50 rounded-xl p-5 text-sm leading-relaxed whitespace-pre-line font-serif text-slate-700 border border-slate-100">
                  {essay}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
