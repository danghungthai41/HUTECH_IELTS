import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "hutechIELTShacker - Luyện Thi IELTS Tích Hợp AI",
  description:
    "Nền tảng luyện thi IELTS trực tuyến ứng dụng trí tuệ nhân tạo (AI), hỗ trợ đầy đủ 4 kỹ năng: Writing, Speaking, Reading, Listening.",
  keywords: "IELTS, luyện thi, AI, Writing, Speaking, Reading, Listening",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
