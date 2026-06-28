"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Loader2, Bot, User, PenLine, BookOpen, Headphones, Mic, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { modalData, skillFilters } from "../dashboard/SkillsGrid";
import { useLanguage } from "@/hooks/useLanguage";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là AI IELTS Assistant. Tôi có thể giúp bạn về các kỹ năng IELTS.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantText += chunk;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: assistantText };
            return next;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: lang === "vi" 
            ? "Xin lỗi, không thể kết nối với AI. Vui lòng kiểm tra API key và thử lại." 
            : "Sorry, could not connect to AI. Please verify API key and try again.",
        },
      ]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD]">
      <Header 
        title={lang === "vi" ? "AI IELTS Chat Assistant" : "AI IELTS Chat Assistant"} 
        subtitle={lang === "vi" ? "Hỏi bất kỳ điều gì về IELTS" : "Ask anything about IELTS"} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Messages and Welcome view */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 1 ? (
            /* Welcome screen when no message has been sent */
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-10 px-4 text-center h-full font-sans">
              {/* Robot Icon */}
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm overflow-hidden p-2">
                <img src="/imgs/hutech.webp" alt="Hutech AI Logo" className="w-full h-full object-contain rounded-full" />
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight mb-3">
                {lang === "vi" ? "Mình có thể giúp gì cho bạn về IELTS?" : "How can I help you with IELTS today?"}
              </h2>
              <p className="text-slate-500 text-sm max-w-lg mb-10 leading-relaxed">
                {lang === "vi"
                  ? "Chọn một kỹ năng để bắt đầu luyện tập, hoặc nhắn tin để hỏi mình bất cứ điều gì nhé"
                  : "Choose a skill to start practicing, or chat with me to ask anything you need"}
              </p>

              {/* Skill Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">
                {/* Viết Card */}
                <div onClick={() => setSelectedSkill("writing")} className="border border-slate-100 rounded-2xl p-5 bg-white hover:border-primary/60 hover:ring-4 hover:ring-primary/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center cursor-pointer group shadow-sm/50">
                  <div className="w-full h-48 relative mb-4 flex items-center justify-center">
                    <img src="/imgs/writing.svg" alt="Viết" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 duration-300" style={{ filter: skillFilters.writing }} />
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1.5">
                    <PenLine className="w-4 h-4 text-primary" />
                    <span>{lang === "vi" ? "Viết" : "Writing"}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {lang === "vi" ? "Làm bài thi thử hoặc nộp bài viết..." : "Take writing practice tests or submit essay..."}
                  </p>
                </div>

                {/* Đọc Card */}
                <div onClick={() => setSelectedSkill("reading")} className="border border-slate-100 rounded-2xl p-5 bg-white hover:border-primary/60 hover:ring-4 hover:ring-primary/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center cursor-pointer group shadow-sm/50">
                  <div className="w-full h-48 relative mb-4 flex items-center justify-center">
                    <img src="/imgs/Reading.svg" alt="Đọc" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 duration-300" style={{ filter: skillFilters.reading }} />
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{lang === "vi" ? "Đọc" : "Reading"}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {lang === "vi" ? "Luyện câu hỏi theo bài đọc và xem d..." : "Practice reading tests and view explana..."}
                  </p>
                </div>

                {/* Nghe Card */}
                <div onClick={() => setSelectedSkill("listening")} className="border border-slate-100 rounded-2xl p-5 bg-white hover:border-primary/60 hover:ring-4 hover:ring-primary/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center cursor-pointer group shadow-sm/50">
                  <div className="w-full h-48 relative mb-4 flex items-center justify-center">
                    <img src="/imgs/Listening.svg" alt="Nghe" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 duration-300" style={{ filter: skillFilters.listening }} />
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1.5">
                    <Headphones className="w-4 h-4 text-primary" />
                    <span>{lang === "vi" ? "Nghe" : "Listening"}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {lang === "vi" ? "Luyện câu hỏi theo audio và xem đáp..." : "Practice listening tests and view detail..."}
                  </p>
                </div>

                {/* Nói Card */}
                <div onClick={() => setSelectedSkill("speaking")} className="border border-slate-100 rounded-2xl p-5 bg-white hover:border-primary/60 hover:ring-4 hover:ring-primary/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center cursor-pointer group shadow-sm/50">
                  <div className="w-full h-48 relative mb-4 flex items-center justify-center">
                    <img src="/imgs/speaking.svg" alt="Nói" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 duration-300" style={{ filter: skillFilters.speaking }} />
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1.5">
                    <Mic className="w-4 h-4 text-primary" />
                    <span>{lang === "vi" ? "Nói" : "Speaking"}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {lang === "vi" ? "Luyện tập với giám khảo AI, trả lời và..." : "Practice with AI examiner, answer and..."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Message dialogue bubble stream */
            <div className="max-w-3xl mx-auto space-y-6 py-4">
              {messages.slice(1).map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-slate-100 border border-slate-200 text-slate-600"}`}>
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <img src="/imgs/hutech.webp" alt="Hutech AI Avatar" className="w-6 h-6 object-contain rounded-full" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm shadow-sm"
                        : "bg-slate-150/50 text-slate-800 rounded-tl-sm border border-slate-200/50"
                    }`}
                  >
                    {msg.content ? (
                      msg.role === "user" ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )
                    ) : (
                      loading && i === messages.length - 2 && (
                        <span className="inline-flex gap-1 pt-1.5 pb-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Rounded-full Input Bar */}
        <div className="border-t border-slate-100 bg-[#FDFDFD] px-4 py-5 font-sans">
          <div className="max-w-3xl mx-auto relative flex items-center shadow-sm rounded-full border border-slate-200/80 bg-white px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === "vi" ? "Gửi tin nhắn..." : "Type a message..."}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 outline-none focus:ring-0 focus:ring-offset-0 py-2 text-sm bg-transparent placeholder-slate-400 text-slate-700"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-full text-slate-400 hover:text-primary disabled:text-slate-300 disabled:hover:text-slate-300 transition-colors flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedSkill && modalData[selectedSkill] && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
             onClick={() => setSelectedSkill(null)}>
          <div
            className="bg-white rounded-[28px] shadow-2xl max-w-2xl w-full relative overflow-hidden flex flex-col p-8 md:p-10 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-2xl font-bold text-slate-800">
                {modalData[selectedSkill].title[lang as "vi" | "en"] || modalData[selectedSkill].title.vi}
              </h3>
              <button
                onClick={() => setSelectedSkill(null)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {modalData[selectedSkill].options.map((opt, i) => {
                const optTitle = opt.title[lang as "vi" | "en"] || opt.title.vi;

                return (
                  <Link
                    key={i}
                    href={opt.href}
                    onClick={() => setSelectedSkill(null)}
                    className={`flex flex-col items-center justify-center p-8 rounded-[20px] border border-slate-100 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group ${opt.colorClass}`}
                  >
                    <div className="w-28 h-28 relative flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={opt.icon}
                        alt={optTitle}
                        className="max-w-full max-h-full object-contain"
                        style={{ filter: skillFilters[selectedSkill] }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">
                      {optTitle}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
