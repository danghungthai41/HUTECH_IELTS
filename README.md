# hutechIELTShacker — Nền tảng luyện thi IELTS với AI

Ứng dụng web luyện thi IELTS đủ 4 kỹ năng (Writing, Reading, Listening, Speaking) tích hợp **AI chấm điểm, gợi ý, giải thích và bài mẫu**, kèm chatbot gia sư AI.

Xây dựng bằng **Next.js 15 · React 19 · TypeScript · MySQL (Drizzle ORM) · Groq LLM**.

---

## ✨ Tính năng

| Kỹ năng | AI hỗ trợ |
|---|---|
| ✍️ **Writing** | Chấm 4 tiêu chí IELTS + bài cải thiện band 8 · gợi ý dàn bài · dò lỗi ngữ pháp |
| 📖 **Reading** | Chấm tự động · gợi ý (trước nộp) / giải thích (sau nộp) cho từng câu |
| 🎧 **Listening** | Phát audio / TTS · chấm tự động · gợi ý & giải thích từng câu |
| 🎤 **Speaking** | Ghi âm + nhận dạng giọng nói · AI đọc câu hỏi · chấm 4 tiêu chí · bài mẫu band 8 |
| 💬 **AI Chat** | Gia sư IELTS trả lời mọi câu hỏi (streaming, Markdown) |
| 🛠️ **Admin** | Quản lý (CRUD) đề thi 4 kỹ năng |

Bảo mật: xác thực JWT (cookie httpOnly), mật khẩu băm PBKDF2, phân quyền user/admin qua middleware.

---

## 🖼️ Kiến trúc & Use case

![Sơ đồ kiến trúc](docs/diagrams/architecture.svg)

![Sơ đồ use case](docs/diagrams/use-case.svg)

---

## 🚀 Cài đặt nhanh

```bash
git clone https://github.com/tdloc113/IELTS_WEB.git
cd IELTS_WEB
npm install

# 1) Tạo database chuẩn (schema + đề thi mẫu + tài khoản admin/demo)
mysql -u root -p < database/ielts_web.sql

# 2) Cấu hình môi trường
cp .env.example .env.local      # rồi điền DATABASE_URL, JWT_SECRET, FIREWORKS_API_KEY (key Groq)

# 3) Chạy
npm run dev                     # http://localhost:3000
```

Tài khoản tạo sẵn (nên đổi mật khẩu sau khi đăng nhập):
- Admin: `admin@ielts.local` / `admin123`
- Demo: `demo@ielts.local` / `demo1234`

> Lấy API key Groq miễn phí tại [console.groq.com/keys](https://console.groq.com/keys). App hỗ trợ mọi endpoint OpenAI-compatible (Groq / OpenAI / Gemini / Fireworks) — chỉ cần đổi biến env, không sửa code.

---

## 🧩 Cấu hình môi trường (`.env.local`)

```env
DATABASE_URL=mysql://root:password@localhost:3306/ielts_web
JWT_SECRET=chuoi-bi-mat-ngau-nhien-that-dai     # tạo: openssl rand -base64 48
FIREWORKS_API_KEY=gsk_...                        # key Groq
FIREWORKS_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
DEEPGRAM_API_KEY=...                             # tùy chọn, cho TTS bài nghe
```

---

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── (app)/        # trang học viên: dashboard, writing, reading, listening, speaking, chat
│   ├── (auth)/       # login, register
│   ├── admin/        # trang quản trị
│   └── api/          # API routes: auth, {skill}, chat, tts, admin
├── components/       # *Test.tsx của 4 kỹ năng, layout, ui (shadcn)
├── hooks/            # useTimer, useSpeech, useLanguage
├── lib/              # auth, jwt, ai/client, db (Drizzle schema/seed), utils
└── types/
database/ielts_web.sql   # script tạo DB chuẩn
docs/diagrams/           # sơ đồ kiến trúc & use case
```

---

## 📚 Tài liệu

- [SETUP.md](SETUP.md) — hướng dẫn cài đặt chi tiết
- [FUNCTIONS_AND_ARCHITECTURE.md](FUNCTIONS_AND_ARCHITECTURE.md) — chức năng từng file, kiến trúc, sơ đồ
- [WORKFLOW.md](WORKFLOW.md) — luồng hoạt động & quy trình

---

## 🛠️ Scripts

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy chế độ phát triển |
| `npm run build` / `npm start` | Build & chạy production |
| `npm run db:push` | Đẩy schema Drizzle vào MySQL |
| `npm run db:seed` | Nạp đề thi mẫu |
| `npm run db:studio` | Mở Drizzle Studio xem DB |
