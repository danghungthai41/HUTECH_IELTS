"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const translations = {
  en: {
    titlePart1: "Supercharge",
    titlePart2: " your IELTS journey with ",
    titlePart3: "AI",
    desc: "Practice and improve your Speaking and Writing skills through detailed feedback from intelligent AI examiners.",
    btn: "Get Started",
    feat1Title: "1,000+ Practice Sets",
    feat1Desc: "Vast question bank curated from official practice tests and real exam questions.",
    feat2Title: "Extensive Feedback",
    feat2Desc: "Grammar & vocabulary fixes and recommendations, idea suggestions, polished version, and more.",
    login: "Log In",
  },
  vi: {
    titlePart1: "Tối ưu hóa",
    titlePart2: " hành trình luyện thi IELTS cùng ",
    titlePart3: "AI",
    desc: "Luyện tập và bứt phá kỹ năng Nói và Viết với những nhận xét, chấm điểm chi tiết từ trí tuệ nhân tạo.",
    btn: "Bắt đầu ngay",
    feat1Title: "1,000+ Bộ Đề Luyện Tập",
    feat1Desc: "Kho đề thi thử phong phú được tổng hợp từ các kỳ thi IELTS thực tế và chính thức.",
    feat2Title: "Phản Hồi Chuyên Sâu",
    feat2Desc: "Sửa lỗi ngữ pháp, từ vựng, gợi ý nâng cấp câu chữ và cung cấp bài mẫu đạt band điểm cao.",
    login: "Đăng nhập",
  },
};

export default function LandingPage() {
  const { lang, changeLanguage } = useLanguage();
  const t = translations[lang as "en" | "vi"] || translations.vi;

  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden flex flex-col justify-between font-sans">
      {/* Decorative Glow Spots */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-100/55 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none -z-10" />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 md:px-12 h-20 flex items-center justify-between z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-transform group-hover:scale-105">
            <img src="/imgs/hutech.webp" alt="Hutech Logo" className="w-6 h-6 object-contain rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            <span className="text-primary">hutech</span>IELTS<span className="text-primary font-black">hacker</span>
          </span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center border border-slate-200/80 rounded-full p-0.5 bg-slate-50 text-xs font-semibold shadow-sm">
            <button
              onClick={() => changeLanguage("en")}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${lang === "en"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => changeLanguage("vi")}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${lang === "vi"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              🇻🇳 VI
            </button>
          </div>

          <Link href="/login">
            <Button variant="ghost" className="text-slate-700 font-semibold hover:bg-slate-100 rounded-full px-5">
              {t.login}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 z-10">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8 pr-0 lg:pr-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            <span className="text-primary font-black">{t.titlePart1}</span>
            {t.titlePart2}
            <span className="relative inline-block font-black">
              {t.titlePart3}
              <span className="absolute left-0 bottom-1 w-full h-[4px] bg-primary rounded-full" />
            </span>
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
            {t.desc}
          </p>

          <div>
            <Link href="/register">
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/95 text-white shadow-md shadow-primary/20 px-8 py-6 text-base font-semibold group transition-all hover:translate-x-0.5">
                {t.btn}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column (Hero Illustration and feature cards below) */}
        <div className="lg:col-span-7 flex flex-col items-center gap-12">
          {/* Main Illustration */}
          <div className="w-full max-w-[560px] relative drop-shadow-xl hover:translate-y-[-4px] transition-transform duration-500">
            <Image
              src="/imgs/examination.svg"
              alt="hutechIELTShacker Assist Robot Illustration"
              width={560}
              height={560}
              priority
              className="object-contain"
            />
          </div>

          {/* Feature Grid directly below the illustration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-[620px] mt-2">
            {/* Feature 1 */}
            <div className="flex flex-col gap-3 items-start">
              <Image
                src="/imgs/Reading.svg"
                alt="Practice Sets"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-lg">{t.feat1Title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{t.feat1Desc}</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-3 items-start">
              <Image
                src="/imgs/Searching.svg"
                alt="Extensive Feedback"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-lg">{t.feat2Title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{t.feat2Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 mt-8 z-10">
        <p>© 2026 hutechIELTShacker. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
