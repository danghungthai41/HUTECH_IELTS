# ExaminAI – Hướng dẫn cài đặt (100% MySQL)

Dự án này đã được cấu trúc lại hoàn toàn để sử dụng **MySQL** làm cơ sở dữ liệu duy nhất và hệ thống **Custom Authentication** tự vận hành qua JWT/Cookie (không sử dụng Supabase).

## Yêu cầu
- Node.js 18+
- Cơ sở dữ liệu MySQL (Chạy local bằng XAMPP, Docker, Laragon hoặc trực tiếp)
- API key Groq (miễn phí tại console.groq.com) — hoặc bất kỳ endpoint OpenAI-compatible nào
- API key Deepgram (tùy chọn, cho tính năng chuyển văn bản thành giọng nói - TTS)

---

## 1. Cài đặt dependencies

```bash
cd "IELTS WEB"
npm install
```

---

## 2. Cấu hình Cơ sở dữ liệu MySQL

1. Khởi động máy chủ MySQL của bạn (ví dụ: cổng mặc định `3306`).
2. Tạo một cơ sở dữ liệu mới cho dự án:
   ```sql
   CREATE DATABASE ielts_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## 3. Cấu hình AI (Groq — mặc định)

1. Đăng ký và tạo API key miễn phí tại https://console.groq.com/keys (key bắt đầu bằng `gsk_`).
2. Model mặc định: `llama-3.3-70b-versatile`.

*Lưu ý: App hỗ trợ mọi endpoint OpenAI-compatible — chỉ cần đổi 3 biến env, không sửa code. Ví dụ OpenAI: `FIREWORKS_BASE_URL=https://api.openai.com/v1`, `AI_MODEL=gpt-4o-mini`. Gemini: `FIREWORKS_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`, `AI_MODEL=gemini-2.0-flash`.*

---

## 4. Cấu hình các biến môi trường (.env.local)

Sao chép `.env.example` thành `.env.local` nếu chưa có:
```bash
cp .env.example .env.local
```

Mở `.env.local` và cập nhật thông tin kết nối và API keys:
```env
# Chuỗi kết nối MySQL
DATABASE_URL=mysql://[username]:[password]@[host]:[port]/ielts_web

# JWT secret (bắt buộc ở production) — tạo bằng: openssl rand -base64 48
JWT_SECRET=your-long-random-secret

# AI (Groq — hoặc bất kỳ endpoint OpenAI-compatible nào)
FIREWORKS_API_KEY=gsk_xxx...
FIREWORKS_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile

# Deepgram TTS (tùy chọn)
DEEPGRAM_API_KEY=xxx...
```

---

## 5. Tạo Database Schema & Migrations

Dự án sử dụng **Drizzle ORM** để quản lý database. Sau khi thiết lập xong `DATABASE_URL` trong `.env.local`, bạn hãy chạy các lệnh sau để khởi tạo các bảng trong MySQL:

```bash
# Tạo các file migration từ schema
npm run db:generate

# Đẩy cấu trúc bảng trực tiếp lên MySQL database
npm run db:push
```

Bạn cũng có thể mở **Drizzle Studio** để xem và chỉnh sửa dữ liệu trực quan:
```bash
npm run db:studio
```

---

## 6. Authentication tự trị (Custom JWT Session)

Hệ thống sử dụng cơ chế bảo mật PBKDF2 của Node.js để băm mật khẩu và lưu giữ session qua HTTP-Only Cookie bằng JWT (`jose`).
- Không cần cấu hình gì thêm trên nền tảng bên ngoài.
- Tài khoản Admin có thể được chỉ định bằng cách thay đổi giá trị `role` thành `'admin'` trong bảng `users` bằng tay hoặc qua Drizzle Studio để truy cập trang quản trị `/admin`.

---

## 7. Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt truy cập: http://localhost:3000

---

## Cấu trúc dự án chính

```
src/
├── app/
│   ├── page.tsx              ← Landing page (Giao diện giới thiệu)
│   ├── (auth)/               ← Đăng nhập / Đăng ký (Đã đổi qua MySQL API)
│   ├── (app)/                ← Dashboard, Writing, Speaking, Reading, Listening, Chat (Sử dụng MySQL)
│   ├── admin/                ← Quản lý đề thi của Admin (Thêm/Sửa/Xóa)
│   └── api/                  ← Các API Endpoint phục vụ chấm bài AI, Auth và CRUD đề thi
├── components/
│   ├── ui/                   ← Thư viện UI components
│   ├── layout/               ← Giao diện khung (Sidebar, Header với bộ chuyển đổi ngôn ngữ EN/VI)
│   ├── writing/              ← Editor làm bài viết
│   ├── speaking/             ← Trình ghi âm làm bài nói
│   ├── reading/              ← Giao diện làm bài đọc
│   └── listening/            ← Giao diện làm bài nghe kèm audio player
├── lib/
│   ├── db/                   ← Cấu hình MySQL connection pool và Schema (Drizzle ORM)
│   ├── auth.ts               ← Các hàm tiện ích mã hóa mật khẩu, ký và kiểm tra JWT
│   └── ai/                   ← AI client hỗ trợ chấm điểm IELTS
├── hooks/
│   ├── useTimer.ts           ← Bộ đếm ngược thời gian
│   └── useSpeech.ts          ← Xử lý chuyển đổi giọng nói thành văn bản
└── types/index.ts
```
