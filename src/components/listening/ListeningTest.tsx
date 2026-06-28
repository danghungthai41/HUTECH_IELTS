"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Clock, CheckCircle, XCircle, FileText, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTimer } from "@/hooks/useTimer";
import { formatTime } from "@/lib/utils";

interface ListeningData {
  id: string;
  title: string;
  audioUrl: string;
  transcript: string;
  timeMinutes: number;
  questions: { id: string; type: string; question: string; options?: string[]; correctAnswer: string }[];
}

function isCorrect(a: string, c: string) {
  return a.trim().toLowerCase() === c.trim().toLowerCase() || a.trim() === c.trim();
}

const BAR_HEIGHTS = [
  15, 30, 45, 60, 25, 40, 55, 70, 85, 60, 
  45, 30, 50, 65, 80, 95, 70, 55, 40, 30, 
  25, 45, 60, 75, 90, 65, 50, 35, 20, 40, 
  55, 75, 85, 60, 45, 30, 25, 40, 50, 35, 
  20, 15, 10, 15, 20
];

export function ListeningTest({ data }: { data: ListeningData }) {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbScore, setDbScore] = useState<number | null>(null);
  const [dbTotal, setDbTotal] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, string>>({});

  async function getAiHelp(qId: string, questionText: string, correctAnswer: string) {
    if (aiLoading[qId]) return;
    setAiLoading((prev) => ({ ...prev, [qId]: true }));
    const mode = submitted ? "explain" : "hint";
    try {
      const res = await fetch("/api/reading/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: data.transcript,
          question: questionText,
          studentAnswer: answers[qId] || "",
          correctAnswer,
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

  const [audioUrl, setAudioUrl] = useState(data.audioUrl);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [useSpeechSynth, setUseSpeechSynth] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0 || useSpeechSynth) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.max(0, Math.min(1, clickX / width));
    audioRef.current.currentTime = newProgress * duration;
    setCurrentTime(newProgress * duration);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  }, [audioUrl]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    // If the audio URL is the default placeholder song, let's try to generate TTS
    if (data.audioUrl.includes("soundhelix.com")) {
      setLoadingAudio(true);
      fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.transcript, voice: "aura-asteria-en" })
      })
      .then(res => {
        if (!res.ok) throw new Error("TTS API failed");
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setLoadingAudio(false);
      })
      .catch(err => {
        console.warn("TTS API failed, will use SpeechSynthesis fallback on play", err);
        setLoadingAudio(false);
        setUseSpeechSynth(true);
      });
    } else {
      setAudioUrl(data.audioUrl);
    }
  }, [data.transcript, data.audioUrl]);

  const { secondsLeft, start, pause } = useTimer(data.timeMinutes * 60, () => handleFinish());

  function handleStart() {
    setStarted(true);
    start();
  }

  function togglePlay() {
    if (useSpeechSynth || audioUrl.includes("soundhelix.com")) {
      if (!synthRef.current) return;
      if (playing) {
        synthRef.current.pause();
        setPlaying(false);
      } else {
        if (synthRef.current.paused) {
          synthRef.current.resume();
          setPlaying(true);
        } else {
          synthRef.current.cancel();
          const cleanText = data.transcript.replace(/[A-Za-z]+ \([^)]+\):|[A-Za-z]+:/g, ""); // Clean speaker tags
          const utt = new SpeechSynthesisUtterance(cleanText);
          const voices = synthRef.current.getVoices();
          // Seek standard high quality UK/US English voices
          const engVoice = voices.find(v => v.lang.startsWith("en-GB") && v.name.includes("Google")) ||
                           voices.find(v => v.lang.startsWith("en-US") && v.name.includes("Google")) ||
                           voices.find(v => v.lang.startsWith("en-GB")) ||
                           voices.find(v => v.lang.startsWith("en-US")) ||
                           voices.find(v => v.lang.startsWith("en"));
          if (engVoice) {
            utt.voice = engVoice;
            utt.lang = engVoice.lang;
          } else {
            utt.lang = "en-US";
          }
          utt.rate = 0.85;
          utt.onend = () => setPlaying(false);
          utteranceRef.current = utt;
          synthRef.current.speak(utt);
          setPlaying(true);
        }
      }
    } else {
      if (!audioRef.current) return;
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    }
  }

  async function handleFinish() {
    if (submitted || saving) return;
    setSaving(true);
    pause();

    try {
      const res = await fetch("/api/listening/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: data.id,
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
            <p className="text-sm text-muted-foreground">
              Nhấn phát âm thanh và trả lời câu hỏi. Transcript sẽ hiện sau khi nộp bài.
            </p>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> {data.timeMinutes} phút · {data.questions.length} câu hỏi
            </div>
            <Button onClick={handleStart} className="w-full" size="lg">Bắt đầu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Timer & submit */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">{data.title}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono font-bold">
            <Clock className="w-4 h-4" /> {formatTime(secondsLeft)}
          </div>
          {!submitted && (
            <Button onClick={handleFinish} disabled={saving} size="sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Nộp bài
            </Button>
          )}
          {submitted && (
            <Badge variant={score >= data.questions.length * 0.7 ? "success" : "destructive"}>
              {score}/{data.questions.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Audio player */}
      <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5 space-y-4">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="hidden"
          />
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlay}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5 transition-all shadow-sm flex-shrink-0"
              disabled={loadingAudio}
            >
              {loadingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : playing ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{data.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${playing ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                {loadingAudio
                  ? "Đang tạo giọng nói AI..."
                  : playing
                  ? `Đang phát âm thanh ${useSpeechSynth ? "(Giọng đọc máy)" : "(Giọng đọc AI)"}`
                  : `Tạm dừng ${useSpeechSynth ? "(Giọng đọc máy)" : "(Giọng đọc AI)"}`}
              </p>
            </div>
            
            {/* Time display */}
            {!useSpeechSynth && duration > 0 && (
              <div className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 flex-shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            )}
          </div>

          {/* Soundwave Visualizer */}
          <div className="pt-1">
            <div 
              ref={waveformRef}
              onClick={handleWaveformClick}
              className={`h-16 flex items-center justify-between gap-[3px] px-3 bg-slate-50/70 border border-slate-100/80 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none ${useSpeechSynth ? "opacity-75 cursor-default" : ""}`}
            >
              {Array.from({ length: 45 }).map((_, i) => {
                const barHeight = BAR_HEIGHTS[i % BAR_HEIGHTS.length];
                const progressFraction = duration > 0 ? currentTime / duration : 0;
                const isPlayed = useSpeechSynth ? playing : (!useSpeechSynth && (i / 45 <= progressFraction));
                
                // Varied animation delays and durations for a natural look
                const animDuration = 0.6 + (i % 5) * 0.15;
                const animDelay = (i % 3) * -0.25;

                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-all duration-200"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: isPlayed 
                        ? "rgb(249, 115, 22)" // Orange-500 (Brand Primary)
                        : "rgb(226, 232, 240)", // Slate-200
                      transformOrigin: "center",
                      animation: (playing && (!useSpeechSynth || i % 2 === 0))
                        ? `waveBounce ${animDuration}s ease-in-out ${animDelay}s infinite alternate`
                        : "none",
                    }}
                  />
                );
              })}
            </div>
            {!useSpeechSynth && duration > 0 && (
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 px-1">
                <span>00:00</span>
                <span>Click vào thanh sóng để tua nhanh</span>
                <span>{formatTime(duration)}</span>
              </div>
            )}
          </div>

          {/* AI Helper Toggle & Transcript Panel */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <div className="w-5 h-5 rounded-full overflow-hidden p-0.5 bg-primary/10 flex items-center justify-center flex-shrink-0">
                <img src="/imgs/hutech.webp" alt="Hutech AI" className="w-full h-full object-contain rounded-full" />
              </div>
              Trợ lý học tập AI hỗ trợ
            </span>
            <Button
              onClick={() => setShowTranscript(!showTranscript)}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/5 hover:text-primary gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              {showTranscript ? "Ẩn Transcript" : "Hiện Transcript"}
            </Button>
          </div>

          {showTranscript && (
            <div className="mt-2 bg-blue-50/40 border border-blue-100/30 rounded-xl p-4 text-xs leading-relaxed whitespace-pre-line text-slate-700 animate-in fade-in duration-200">
              <div className="font-bold text-[10px] text-blue-800 uppercase tracking-wider mb-2">Transcript Bài Nghe:</div>
              {data.transcript}
            </div>
          )}

          <style>{`
            @keyframes waveBounce {
              0% {
                transform: scaleY(0.35);
              }
              100% {
                transform: scaleY(1.1);
              }
            }
          `}</style>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-5">
        {data.questions.map((q, idx) => {
          const answered = answers[q.id] ?? "";
          const correct = submitted ? isCorrect(answered, q.correctAnswer) : null;

          return (
            <div key={q.id} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-muted text-xs flex items-center justify-center flex-shrink-0 font-semibold mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {q.type === "fill_blank" ? "Fill Blank" : "Multiple Choice"}
                    </span>
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

              {q.options ? (
                <div className="pl-8 space-y-2">
                  {q.options.map((opt) => {
                    const optVal = opt[0]; // "A", "B", etc.
                    const selected = answers[q.id] === optVal;
                    const isCorrectOpt = q.correctAnswer === optVal;
                    let cls = "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ";
                    if (!submitted) {
                      cls += selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50";
                    } else {
                      if (isCorrectOpt) cls += "border-emerald-500 bg-emerald-50 text-emerald-800";
                      else if (selected && !isCorrectOpt) cls += "border-red-400 bg-red-50 text-red-800";
                      else cls += "border-border";
                    }
                    return (
                      <div key={opt} className={cls}
                        onClick={() => !submitted && setAnswers((p) => ({ ...p, [q.id]: optVal }))}>
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
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    placeholder="Nhập câu trả lời..."
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 ${
                      submitted ? (correct ? "border-emerald-500 bg-emerald-50" : "border-red-400 bg-red-50") : "border-input bg-background"
                    }`}
                  />
                  {submitted && !correct && (
                    <p className="text-xs text-emerald-700 mt-1">✓ Đáp án: <strong>{q.correctAnswer}</strong></p>
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

      {/* Bottom script helper placeholder */}
    </div>
  );
}
