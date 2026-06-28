"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const skillFilters: Record<string, string> = {
  writing: "",
  speaking: "",
  reading: "",
  listening: "",
};

const skills = [
  {
    key: "writing",
    href: "/writing",
    svgPath: "/imgs/writing.svg",
    label: { vi: "Viết", en: "Writing" },
    textColor: "text-orange-600",
    desc: {
      vi: "Task 1 & Task 2 với AI chấm điểm",
      en: "Task 1 & Task 2 with AI scoring",
    },
    badge: "Hot",
    imgFilter: skillFilters.writing,
  },
  {
    key: "speaking",
    href: "/speaking",
    svgPath: "/imgs/speaking.svg",
    label: { vi: "Nói", en: "Speaking" },
    textColor: "text-orange-600",
    desc: {
      vi: "Mô phỏng giám khảo AI Part 1-3",
      en: "Simulate AI Examiner Part 1-3",
    },
    imgFilter: skillFilters.speaking,
  },
  {
    key: "reading",
    href: "/reading",
    svgPath: "/imgs/Reading.svg",
    label: { vi: "Đọc", en: "Reading" },
    textColor: "text-orange-600",
    desc: {
      vi: "MCQ, T/F/NG, Matching, Short Answer",
      en: "MCQ, T/F/NG, Matching, Short Answer",
    },
    imgFilter: skillFilters.reading,
  },
  {
    key: "listening",
    href: "/listening",
    svgPath: "/imgs/Listening.svg",
    label: { vi: "Nghe", en: "Listening" },
    textColor: "text-orange-600",
    desc: {
      vi: "Luyện nghe với file âm thanh thực tế",
      en: "Practice listening with real audio",
    },
    imgFilter: skillFilters.listening,
  },
];

export const modalData: Record<
  string,
  {
    title: { vi: string; en: string };
    options: {
      title: { vi: string; en: string };
      icon: string;
      href: string;
      colorClass: string;
    }[];
  }
> = {
  writing: {
    title: { vi: "Viết", en: "Writing" },
    options: [
      {
        title: { vi: "Bắt đầu viết", en: "Start Writing" },
        icon: "/imgs/writing.svg",
        href: "/writing",
        colorClass: "hover:border-orange-200 hover:bg-orange-50/30 border-orange-100 bg-orange-50/10",
      },
      {
        title: { vi: "Gửi bài viết có sẵn", en: "Submit Existing Essay" },
        icon: "/imgs/Searching.svg",
        href: "/writing/custom",
        colorClass: "hover:border-primary/20 hover:bg-primary/[0.02] border-slate-100 bg-slate-50/20",
      },
    ],
  },
  speaking: {
    title: { vi: "Nói", en: "Speaking" },
    options: [
      {
        title: { vi: "Luyện nói theo đề", en: "Speak on Topics" },
        icon: "/imgs/speaking.svg",
        href: "/speaking",
        colorClass: "hover:border-orange-200 hover:bg-orange-50/30 border-orange-100 bg-orange-50/10",
      },
      {
        title: { vi: "Trò chuyện tự do", en: "Free AI Conversation" },
        icon: "/imgs/Searching.svg",
        href: "/chat",
        colorClass: "hover:border-primary/20 hover:bg-primary/[0.02] border-slate-100 bg-slate-50/20",
      },
    ],
  },
  reading: {
    title: { vi: "Đọc", en: "Reading" },
    options: [
      {
        title: { vi: "Làm đề thi thử", en: "Take Reading Tests" },
        icon: "/imgs/Reading.svg",
        href: "/reading",
        colorClass: "hover:border-orange-200 hover:bg-orange-50/30 border-orange-100 bg-orange-50/10",
      },
      {
        title: { vi: "Đọc dịch song ngữ", en: "Bilingual Reading" },
        icon: "/imgs/Searching.svg",
        href: "/reading",
        colorClass: "hover:border-primary/20 hover:bg-primary/[0.02] border-slate-100 bg-slate-50/20",
      },
    ],
  },
  listening: {
    title: { vi: "Nghe", en: "Listening" },
    options: [
      {
        title: { vi: "Làm đề thi nghe", en: "Take Listening Tests" },
        icon: "/imgs/Listening.svg",
        href: "/listening",
        colorClass: "hover:border-orange-200 hover:bg-orange-50/30 border-orange-100 bg-orange-50/10",
      },
      {
        title: { vi: "Luyện nghe thụ động", en: "Passive Listening" },
        icon: "/imgs/Searching.svg",
        href: "/listening",
        colorClass: "hover:border-primary/20 hover:bg-primary/[0.02] border-slate-100 bg-slate-50/20",
      },
    ],
  },
};

export function SkillsGrid() {
  const { lang } = useLanguage();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const t = {
    vi: {
      heading: "Luyện tập theo kỹ năng",
      practiceNow: "Luyện ngay",
    },
    en: {
      heading: "Practice by Skills",
      practiceNow: "Practice Now",
    },
  }[lang] || {
    vi: {
      heading: "Luyện tập theo kỹ năng",
      practiceNow: "Luyện ngay",
    },
    en: {
      heading: "Practice by Skills",
      practiceNow: "Practice Now",
    },
  }.vi;

  const currentModal = selectedSkill ? modalData[selectedSkill] : null;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-4">{t.heading}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((s) => {
          const labelText = s.label[lang as "vi" | "en"] || s.label.vi;
          const descText = s.desc[lang as "vi" | "en"] || s.desc.vi;

          return (
            <div key={s.key} onClick={() => setSelectedSkill(s.key)}>
              <Card className="hover:shadow-md hover:border-primary/60 hover:ring-4 hover:ring-primary/10 transition-all cursor-pointer h-full group duration-300">
                <CardContent className="p-6 flex flex-row items-center justify-between gap-4 h-full min-h-[160px]">
                  <div className="flex-1 flex flex-col justify-between h-full min-h-[120px]">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-lg text-slate-800">{labelText}</h3>
                        {s.badge && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none text-xs px-2 py-0.5">
                            {s.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">{descText}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-4 text-sm font-semibold ${s.textColor}`}>
                      {t.practiceNow}{" "}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                    </div>
                  </div>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 relative flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-2xl p-1.5 shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={s.svgPath}
                      alt={labelText}
                      className="max-w-full max-h-full object-contain"
                      style={{ filter: s.imgFilter }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Modal Popup */}
      {selectedSkill && currentModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setSelectedSkill(null)}>
          <div
            className="bg-white rounded-[28px] shadow-2xl max-w-2xl w-full relative overflow-hidden flex flex-col p-8 md:p-10 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-2xl font-bold text-slate-800">
                {currentModal.title[lang as "vi" | "en"] || currentModal.title.vi}
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
              {currentModal.options.map((opt, i) => {
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
