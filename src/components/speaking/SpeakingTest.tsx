"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Volume2, Clock, ChevronRight, Loader2, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSpeech } from "@/hooks/useSpeech";
import { useTimer } from "@/hooks/useTimer";
import { formatTime, bandToColor, bandToLabel } from "@/lib/utils";
import type { SpeakingScoreResult } from "@/types";

interface SpeakingTestProps {
  test: {
    id: string;
    title: string;
    part: "part1" | "part2" | "part3";
    questions: string[];
    cueCard?: string;
    preparationTime?: number;
    speakingTime: number;
  };
}

type Phase = "intro" | "prep" | "speaking" | "scoring" | "result";

export function SpeakingTest({ test }: SpeakingTestProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>(Array(test.questions.length).fill(""));
  const [result, setResult] = useState<SpeakingScoreResult | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const { isRecording, transcript, error, startRecording, stopRecording, setTranscript } = useSpeech();
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, {
    sampleAnswer: string;
    vocabulary: { word: string; meaning: string; example: string }[];
  }>>({});

  async function getSpeakingSample(qIdx: number, questionText: string) {
    if (aiLoading[qIdx]) return;
    setAiLoading((prev) => ({ ...prev, [qIdx]: true }));
    try {
      const res = await fetch("/api/speaking/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setAiResults((prev) => ({ ...prev, [qIdx]: data }));
    } catch {
      alert("Không thể kết nối với AI gợi ý bài mẫu lúc này.");
    }
    setAiLoading((prev) => ({ ...prev, [qIdx]: false }));
  }

  const prepTimer = useTimer(test.preparationTime ?? 60, () => setPhase("speaking"));
  const speakTimer = useTimer(
    Math.ceil(test.speakingTime / test.questions.length),
    () => handleNextQuestion()
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    }
  }, []);

  function speak(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    
    // Clean up text if it contains speaker tags
    const cleanText = text.replace(/^[A-Za-z\s]+:/, "").trim();
    const utt = new SpeechSynthesisUtterance(cleanText);
    
    const voices = synthRef.current.getVoices();
    
    // Look for high-quality American or British voices
    const preferredVoices = [
      "Google US English",
      "Google UK English Female",
      "Google UK English Male",
      "Microsoft David",
      "Microsoft Hazel",
      "Samantha",
      "Daniel",
      "Karen",
    ];
    
    let selectedVoice = null;
    
    for (const pref of preferredVoices) {
      const found = voices.find(v => v.name.includes(pref));
      if (found) {
        selectedVoice = found;
        break;
      }
    }
    
    if (!selectedVoice) {
      // Fallback: any US or UK or English voice
      selectedVoice = voices.find(v => v.lang.startsWith("en-US")) || 
                      voices.find(v => v.lang.startsWith("en-GB")) ||
                      voices.find(v => v.lang.startsWith("en-")) ||
                      voices.find(v => v.lang.startsWith("en"));
    }
    
    if (selectedVoice) {
      utt.voice = selectedVoice;
      utt.lang = selectedVoice.lang;
    } else {
      utt.lang = "en-US";
    }
    
    utt.rate = 0.85; // Slightly slower for better IELTS clarity
    synthRef.current.speak(utt);
  }

  function startPrep() {
    if (test.part === "part2" && test.preparationTime) {
      setPhase("prep");
      prepTimer.start();
    } else {
      startSpeaking();
    }
  }

  function startSpeaking() {
    setPhase("speaking");
    speak(test.questions[0]);
    setTimeout(() => {
      startRecording((t) => {
        setTranscripts((prev) => {
          const next = [...prev];
          next[currentQ] = t;
          return next;
        });
      });
      speakTimer.start();
    }, 2000);
  }

  async function handleNextQuestion() {
    const audioBlob = await stopRecording();
    setTranscripts((prev) => {
      const next = [...prev];
      next[currentQ] = transcript || prev[currentQ];
      return next;
    });
    setTranscript("");

    if (currentQ < test.questions.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      speakTimer.reset();
      speak(test.questions[nextQ]);
      setTimeout(() => {
        startRecording((t) => {
          setTranscripts((prev) => {
            const next = [...prev];
            next[nextQ] = t;
            return next;
          });
        });
        speakTimer.start();
      }, 2000);
    } else {
      await handleFinish();
    }
  }

  async function handleFinish() {
    speakTimer.pause();
    const finalTranscripts = transcripts.map((t, i) => t || `(No response for question ${i + 1})`);
    setPhase("scoring");
    setScoreError(null);
    try {
      const res = await fetch("/api/speaking/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: test.id,
          part: test.part,
          questions: test.questions,
          transcripts: finalTranscripts,
        }),
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
    setPhase("result");
  }

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <Card className="max-w-xl w-full">
          <CardContent className="p-8 space-y-6">
            <div>
              <Badge className="mb-2">{test.part.toUpperCase()}</Badge>
              <h2 className="text-2xl font-bold">{test.title}</h2>
            </div>
            {test.cueCard && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm whitespace-pre-line">
                <div className="font-semibold text-amber-800 mb-2">Cue Card</div>
                <div className="text-amber-900">{test.cueCard}</div>
              </div>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-500" />
                {test.questions.length} câu hỏi · AI đọc câu hỏi bằng giọng nói
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-500" />
                Bật loa và microphone trước khi bắt đầu
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                {Math.ceil(test.speakingTime / 60)} phút luyện nói
              </div>
            </div>
            <Button onClick={startPrep} size="lg" className="w-full">
              Bắt đầu <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── PREP ──
  if (phase === "prep") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <Card className="max-w-xl w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl font-mono font-bold text-amber-600">
              {formatTime(prepTimer.secondsLeft)}
            </div>
            <p className="text-lg font-medium">Thời gian chuẩn bị</p>
            {test.cueCard && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm whitespace-pre-line text-left">
                {test.cueCard}
              </div>
            )}
            <Button onClick={() => { prepTimer.pause(); startSpeaking(); }} variant="outline">
              Bắt đầu nói ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── SPEAKING ──
  if (phase === "speaking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 gap-6">
        <Badge variant="secondary">{test.part.toUpperCase()} — Câu {currentQ + 1}/{test.questions.length}</Badge>

        {/* Question */}
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => speak(test.questions[currentQ])}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Volume2 className="w-4 h-4" /> Nghe lại câu hỏi
            </button>
            <div className="flex items-center gap-2 font-mono font-bold text-rose-600">
              <Clock className="w-4 h-4" />
              {formatTime(speakTimer.secondsLeft)}
            </div>
          </div>
          <p className="text-xl font-medium text-center leading-relaxed">
            "{test.questions[currentQ]}"
          </p>
        </div>

        {/* Mic */}
        <div className="relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? "bg-rose-500 recording-pulse" : "bg-muted"}`}>
            {isRecording ? (
              <Mic className="w-10 h-10 text-white" />
            ) : (
              <MicOff className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Live transcript */}
        {transcript && (
          <div className="max-w-2xl w-full bg-muted rounded-lg p-4 text-sm leading-relaxed">
            <span className="text-xs text-muted-foreground block mb-1">Phiên âm:</span>
            {transcript}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleNextQuestion}>
            {currentQ < test.questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── SCORING ──
  if (phase === "scoring") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">AI đang đánh giá phần thi Speaking của bạn...</p>
      </div>
    );
  }

  // ── RESULT: ERROR ──
  if (phase === "result" && scoreError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-700 font-medium mb-4">{scoreError}</p>
          <Button variant="outline" onClick={() => handleFinish()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <CheckCircle className="w-6 h-6 text-emerald-500" /> Kết quả Speaking
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Fluency & Coherence", value: result.fluencyCoherence },
            { label: "Lexical Resource", value: result.lexicalResource },
            { label: "Grammatical Range", value: result.grammaticalRange },
            { label: "Pronunciation", value: result.pronunciation },
          ].map((s) => (
            <div key={s.label} className="bg-muted rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${bandToColor(parseFloat(s.value))}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
          <div className="text-muted-foreground text-sm mb-1">Overall Band</div>
          <div className={`text-5xl font-extrabold ${bandToColor(parseFloat(result.overallBand))}`}>
            {result.overallBand}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Nhận xét chi tiết</h3>
          <div className="bg-blue-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line text-blue-900">
            {result.feedback}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Phiên âm câu trả lời</h3>
          {test.questions.map((q, i) => (
            <div key={i} className="mb-4 bg-muted rounded-lg p-4">
              <div className="font-medium text-sm mb-1">Q{i + 1}: {q}</div>
              <div className="text-sm text-muted-foreground italic">
                {transcripts[i] || "(Không có phản hồi)"}
              </div>

              {/* AI Help Button */}
              <div className="mt-3 flex items-center justify-between">
                <Button
                  onClick={() => getSpeakingSample(i, q)}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/5 hover:text-primary gap-1"
                  disabled={aiLoading[i]}
                >
                  {aiLoading[i] ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full overflow-hidden p-0.5 bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <img src="/imgs/hutech.webp" alt="Hutech AI" className="w-full h-full object-contain rounded-full" />
                    </div>
                  )}
                  Xem Bài mẫu & Từ vựng AI
                </Button>
              </div>

              {/* Collapsible AI Results */}
              {aiResults[i] && (
                <div className="mt-3.5 border-t border-slate-200/50 pt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-emerald-50/50 border border-emerald-100/30 rounded-xl p-3.5 text-xs leading-relaxed text-slate-700">
                    <div className="font-bold text-[10px] text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-full overflow-hidden p-0.5 bg-primary/10 flex items-center justify-center">
                        <img src="/imgs/hutech.webp" alt="Hutech AI" className="w-full h-full object-contain rounded-full" />
                      </div>
                      Bài mẫu gợi ý (Band 8.0+):
                    </div>
                    <p className="font-serif leading-relaxed">{aiResults[i].sampleAnswer}</p>
                  </div>

                  {aiResults[i].vocabulary && aiResults[i].vocabulary.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider pl-1">
                        Từ vựng học thuật ghi điểm:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiResults[i].vocabulary.map((vocab, vIdx) => (
                          <div key={vIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs">
                            <p className="font-bold text-primary font-serif">{vocab.word}</p>
                            <p className="text-slate-500 italic">{vocab.meaning}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-serif">Ex: {vocab.example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
