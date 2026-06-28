"use client";

import { useState, useEffect } from "react";
import { Clock, FileText, Loader2, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimer } from "@/hooks/useTimer";
import { countWords, formatTime, bandToColor, bandToLabel } from "@/lib/utils";
import type { WritingScoreResult } from "@/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface WritingTest {
  id: string;
  title: string;
  task: "task1" | "task2";
  prompt: string;
  imageUrl: string | null;
  timeMinutes: number;
}

interface Props {
  test: WritingTest;
}

const MIN_WORDS = { task1: 150, task2: 250 };

export function WritingEditor({ test }: Props) {
  const [essay, setEssay] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<WritingScoreResult | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [showImproved, setShowImproved] = useState(false);
  const [started, setStarted] = useState(false);

  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [grammarResult, setGrammarResult] = useState<{
    errors: { original: string; correction: string; explanation: string }[];
    correctedEssay: string;
  } | null>(null);

  const [checkingIdeas, setCheckingIdeas] = useState(false);
  const [ideasResult, setIdeasResult] = useState<{
    outline: string;
    vocabulary: { word: string; meaning: string; example: string }[];
  } | null>(null);

  async function checkGrammar() {
    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      alert("Vui lòng viết bài tối thiểu 10 từ để trợ lý AI có thể rà soát lỗi.");
      return;
    }
    if (checkingGrammar) return;
    setCheckingIdeas(false);
    setIdeasResult(null);
    setCheckingGrammar(true);
    setGrammarResult(null);
    try {
      const res = await fetch("/api/writing/check-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setGrammarResult(data);
    } catch {
      alert("Không thể kết nối với AI sửa ngữ pháp. Vui lòng thử lại sau.");
    }
    setCheckingGrammar(false);
  }

  async function getWritingIdeas() {
    if (checkingIdeas) return;
    setCheckingIdeas(true);
    setIdeasResult(null);
    setCheckingGrammar(false);
    setGrammarResult(null);
    try {
      const res = await fetch("/api/writing/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: test.task, prompt: test.prompt }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setIdeasResult(data);
    } catch {
      alert("Không thể kết nối với AI gợi ý ý tưởng lúc này.");
    }
    setCheckingIdeas(false);
  }

  const applyCorrections = () => {
    if (grammarResult && grammarResult.correctedEssay) {
      setEssay(grammarResult.correctedEssay);
      setGrammarResult(null);
    }
  };

  const minWords = MIN_WORDS[test.task];
  const wordCount = countWords(essay);
  const wordProgress = Math.min((wordCount / minWords) * 100, 100);

  const { secondsLeft, isRunning, elapsedSeconds, start, pause } = useTimer(
    test.timeMinutes * 60,
    () => handleSubmit()
  );

  useEffect(() => {
    if (started && !isRunning && !submitted) start();
  }, [started]);

  async function handleSubmit() {
    if (submitted || scoring) return;
    setSubmitted(true);
    setScoring(true);
    setScoreError(null);
    pause();

    try {
      const res = await fetch("/api/writing/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: test.id, task: test.task, prompt: test.prompt, essay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "API error");
      setResult(data);
    } catch (err) {
      setScoreError(
        err instanceof Error && err.message !== "API error"
          ? err.message
          : "Không thể kết nối với AI chấm điểm. Vui lòng thử lại sau."
      );
    }
    setScoring(false);
  }

  const timerWarning = secondsLeft < 300 && !submitted;

  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <Badge variant="secondary" className="w-fit mb-2">
              {test.task === "task1" ? "Task 1" : "Task 2"}
            </Badge>
            <CardTitle className="text-xl">{test.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line">
              {test.prompt}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> Thời gian: {test.timeMinutes} phút
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> Tối thiểu: {minWords} từ
              </div>
            </div>
            <Button onClick={() => setStarted(true)} className="w-full" size="lg">
              Bắt đầu làm bài
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b ${timerWarning ? "bg-red-50 border-red-200" : "bg-white"}`}>
        <div>
          <span className="font-medium text-sm">{test.title}</span>
          <Badge variant="secondary" className="ml-2">
            {test.task === "task1" ? "Task 1" : "Task 2"}
          </Badge>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground">
            <span className={wordCount >= minWords ? "text-emerald-600 font-semibold" : ""}>
              {wordCount}
            </span>
            /{minWords} từ
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timerWarning ? "text-red-600" : ""}`}>
            <Clock className="w-5 h-5" />
            {formatTime(secondsLeft)}
          </div>
          {!submitted && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={getWritingIdeas} 
                variant="outline" 
                className="border-primary/20 text-primary hover:bg-primary/5 hover:text-primary gap-1"
                disabled={checkingGrammar || checkingIdeas}
              >
                {checkingIdeas && <Loader2 className="w-4 h-4 animate-spin" />}
                AI Gợi ý Dàn bài
              </Button>
              <Button 
                onClick={checkGrammar} 
                variant="outline" 
                className="border-primary/20 text-primary hover:bg-primary/5 hover:text-primary gap-1"
                disabled={checkingGrammar || checkingIdeas}
              >
                {checkingGrammar && <Loader2 className="w-4 h-4 animate-spin" />}
                Trợ lý AI sửa lỗi
              </Button>
              <Button onClick={handleSubmit} disabled={wordCount < 10}>
                Nộp bài
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Prompt panel */}
        <div className="w-1/3 border-r p-6 overflow-y-auto bg-gray-50">
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Đề bài
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line">{test.prompt}</p>
        </div>

        {/* Editor / Results */}
        <div className="flex-1 flex flex-col min-w-0">
          {!submitted ? (
            <div className="flex flex-col flex-1 p-6">
              <div className="mb-3">
                <Progress value={wordProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Số từ: {wordCount}</span>
                  <span>Mục tiêu: {minWords}</span>
                </div>
              </div>
              <Textarea
                className="flex-1 min-h-0 text-base leading-relaxed font-serif resize-none"
                placeholder={`Bắt đầu viết bài ${test.task === "task1" ? "Task 1" : "Task 2"} của bạn...`}
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {scoring ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">AI đang chấm điểm bài của bạn...</p>
                </div>
              ) : scoreError ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
                    <p className="text-red-700 font-medium mb-4">{scoreError}</p>
                    <Button
                      onClick={() => { setSubmitted(false); setScoreError(null); }}
                      variant="outline"
                    >
                      Thử lại
                    </Button>
                  </div>
                </div>
              ) : result ? (
                <>
                  {/* Scores */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Kết quả chấm điểm
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Task Achievement", value: result.taskAchievement },
                        { label: "Coherence & Cohesion", value: result.coherenceCohesion },
                        { label: "Lexical Resource", value: result.lexicalResource },
                        { label: "Grammatical Range", value: result.grammaticalRange },
                      ].map((s) => (
                        <div key={s.label} className="bg-muted rounded-lg p-4">
                          <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                          <div className={`text-2xl font-bold ${bandToColor(parseFloat(s.value))}`}>
                            {s.value}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {bandToLabel(parseFloat(s.value))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                      <div className="text-muted-foreground text-sm mb-1">Overall Band</div>
                      <div className={`text-5xl font-extrabold ${bandToColor(parseFloat(result.overallBand))}`}>
                        {result.overallBand}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {bandToLabel(parseFloat(result.overallBand))}
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <h3 className="font-semibold mb-3">Nhận xét chi tiết</h3>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line text-blue-900">
                      {result.feedback}
                    </div>
                  </div>

                  {/* Improved Essay */}
                  {result.improvedEssay && (
                    <div>
                      <button
                        onClick={() => setShowImproved(!showImproved)}
                        className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
                      >
                        Bài mẫu cải thiện (Band 8+)
                        {showImproved ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {showImproved && (
                        <div className="mt-3 bg-emerald-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line text-emerald-900 border border-emerald-200">
                          {result.improvedEssay}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Your essay */}
                  <div>
                    <h3 className="font-semibold mb-3">Bài viết của bạn ({wordCount} từ)</h3>
                    <div className="bg-muted rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line font-serif">
                      {essay}
                  </div>
                </div>
              </>
              ) : null}
            </div>
          )}
        </div>

        {/* AI Side Panel */}
        {!submitted && (grammarResult || checkingGrammar || ideasResult || checkingIdeas) && (
          <div className="w-[380px] border-l bg-white flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full overflow-hidden p-0.5 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <img src="/imgs/hutech.webp" alt="Hutech AI" className="w-full h-full object-contain rounded-full" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">
                  {ideasResult || checkingIdeas ? "AI Gợi ý Ý tưởng" : "Trợ lý Sửa lỗi AI"}
                </h4>
              </div>
              <button 
                onClick={() => { 
                  setGrammarResult(null); 
                  setCheckingGrammar(false); 
                  setIdeasResult(null); 
                  setCheckingIdeas(false); 
                }}
                className="text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
              >
                Đóng
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Checking Grammar Loader */}
              {checkingGrammar && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-slate-500 font-medium">AI đang rà soát lỗi ngữ pháp...</p>
                </div>
              )}

              {/* Checking Ideas Loader */}
              {checkingIdeas && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-slate-500 font-medium">AI đang lập dàn bài & gợi ý từ vựng...</p>
                </div>
              )}

              {/* Grammar Check Results */}
              {grammarResult && (
                <>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {grammarResult.errors.length > 0 
                      ? `Phát hiện ${grammarResult.errors.length} lỗi cần sửa` 
                      : "Không phát hiện lỗi ngữ pháp nào!"}
                  </div>
                  
                  {grammarResult.errors.map((err, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Lỗi sai</span>
                        <p className="text-sm text-red-600 line-through mt-1 font-serif">{err.original}</p>
                      </div>
                      <div className="border-t border-slate-100/50 pt-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Sửa lại</span>
                        <p className="text-sm text-emerald-700 font-semibold mt-1 font-serif">{err.correction}</p>
                      </div>
                      <div className="bg-blue-50/50 text-[11px] text-blue-900 rounded-lg p-2.5 mt-1 border border-blue-100/30 leading-relaxed">
                        {err.explanation}
                      </div>
                    </div>
                  ))}

                  {grammarResult.errors.length > 0 && (
                    <Button 
                      onClick={applyCorrections} 
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Áp dụng tất cả sửa đổi
                    </Button>
                  )}
                </>
              )}

              {/* Writing Ideas / Outlines Results */}
              {ideasResult && (
                <div className="space-y-5">
                  <div>
                    <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Dàn ý gợi ý (Band 8+)</h5>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-sans">
                      <MarkdownRenderer content={ideasResult.outline} />
                    </div>
                  </div>
                  
                  {ideasResult.vocabulary && ideasResult.vocabulary.length > 0 && (
                    <div>
                      <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Từ vựng & Mẫu câu ăn điểm</h5>
                      <div className="space-y-3">
                        {ideasResult.vocabulary.map((vocab, i) => (
                          <div key={i} className="border border-slate-100 rounded-xl p-3 bg-slate-50/20 text-xs space-y-1">
                            <p className="font-bold text-primary text-sm font-serif">{vocab.word}</p>
                            <p className="text-slate-500 italic font-medium">{vocab.meaning}</p>
                            <p className="text-slate-600 bg-slate-50/80 px-2 py-1.5 rounded border border-slate-100/50 leading-relaxed font-serif">
                              Ex: {vocab.example}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
