# hutechIELTShacker – Tài Liệu Hướng Dẫn Workflow Hệ Thống

Tài liệu này tổng hợp toàn bộ quy trình thiết lập, vận hành, cấu trúc thư mục và các luồng công việc (workflows) cốt lõi của hệ thống **hutechIELTShacker** (trước đây là ExaminAI) – nền tảng luyện thi IELTS tích hợp Trí Tuệ Nhân Tạo (AI).

---

## I. Tổng Quan Dự Án

*   **Tên ứng dụng:** `hutechIELTShacker`
*   **Công nghệ sử dụng:**
    *   **Frontend & Backend (Fullstack):** Next.js 15.0.4 (React 19, TypeScript).
    *   **CSS & Styling:** TailwindCSS, CSS Variables (tự động đồng bộ hóa màu sắc cho SVG).
    *   **Cơ sở dữ liệu:** MySQL (sử dụng **Drizzle ORM** để quản lý Schema, Migrations và Query).
    *   **Bảo mật & Auth:** Custom Session JWT (sử dụng thư viện `jose` và HTTP-Only Cookie).
    *   **Trí tuệ nhân tạo (AI):** Groq API (`llama-3.3-70b-versatile`) qua endpoint OpenAI-compatible, gọi bằng `fetch` trực tiếp (có thể đổi sang OpenAI/Gemini/Fireworks chỉ bằng biến env).
    *   **Text-to-Speech (TTS):** Deepgram API để phát âm thanh trong bài nghe hoặc đoạn đối thoại.

---

## II. Quy Trình Cài Đặt & Khởi Tạo Cơ Sở Dữ Liệu (Setup & DB Workflow)

Khi chuyển giao hoặc khởi tạo lại dự án trên môi trường mới, thực hiện các bước sau:

```mermaid
graph TD
    A[Cài đặt Node Dependencies] --> B[Cấu hình file .env.local]
    B --> C[Tạo Database MySQL]
    C --> D[Chạy db:generate tạo migrations]
    D --> E[Chạy db:push đẩy schema lên MySQL]
    E --> F[Chạy db:seed nạp đề thi mẫu]
    F --> G[Khởi động dev server: npm run dev]
```

### Các lệnh cụ thể:
1.  **Cài đặt packages:**
    ```bash
    npm install
    ```
2.  **Tạo database trong MySQL:**
    ```sql
    CREATE DATABASE ielts_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
3.  **Cấu hình biến môi trường (`.env.local`):**
    ```env
    DATABASE_URL=mysql://root:123456@localhost:3306/ielts_web
    JWT_SECRET=your-long-random-secret
    FIREWORKS_API_KEY=gsk_your_groq_key_here
    FIREWORKS_BASE_URL=https://api.groq.com/openai/v1
    AI_MODEL=llama-3.3-70b-versatile
    DEEPGRAM_API_KEY=your_key_here
    JWT_SECRET=any_long_random_string_here
    ```
4.  **Tạo bảng & Đưa dữ liệu mẫu vào DB:**
    ```bash
    # Tạo migration từ Schema Drizzle
    npm run db:generate

    # Đồng bộ cấu trúc bảng lên MySQL
    npm run db:push

    # Seed dữ liệu mẫu (đề thi Viết, Nói, Đọc, Nghe)
    npm run db:seed
    ```
5.  **Chạy server phát triển:**
    ```bash
    npm run dev
    ```

---

## III. Các Luồng Công Việc Chính (Core Workflows)

### 1. Luồng Xác Thực Người Dùng (Authentication Workflow)
*   **Đăng ký:** Người dùng nhập Email, Họ tên và Mật khẩu. Hệ thống mã hóa mật khẩu bằng thuật toán PBKDF2 (Native Node.js Crypto) và lưu vào bảng `users`.
*   **Đăng nhập thường:** So khớp email và verify mã băm PBKDF2. Tạo JWT token chứa `userId` và `role`, lưu vào HTTP-Only Cookie tên là `session` có hạn 7 ngày.
*   **Dùng thử (Guest Login):** Tạo một tài khoản ngẫu nhiên `guest_[uuid]@trial.com` trực tiếp trong MySQL, tự động tạo phiên JWT và chuyển hướng đến Dashboard mà không bắt buộc đăng ký tài khoản.
*   **Phân quyền (Middleware):** File [middleware.ts](file:///Users/tranduyloc/Desktop/IELTS%20WEB/middleware.ts) sẽ chặn các request:
    *   Yêu cầu đăng nhập khi vào `/dashboard`, `/writing`, `/speaking`, `/reading`, `/listening`, `/chat`.
    *   Chỉ tài khoản có `role: 'admin'` mới được vào các trang thuộc `/admin`.

---

### 2. Luồng Luyện Viết (Writing Practice & AI Scoring Workflow)

```mermaid
sequenceDiagram
    participant User as Học Viên
    participant FE as Frontend Dashboard
    participant API as API (/api/writing/score)
    participant AI as Groq AI
    participant DB as MySQL Database

    User->>FE: Chọn đề thi & Viết bài (Task 1 hoặc Task 2)
    User->>FE: Bấm "Nộp bài"
    FE->>API: Gửi JSON { testId, task, prompt, essay }
    API->>AI: Gửi prompt chấm điểm chi tiết (theo tiêu chí IELTS)
    AI-->>API: Trả về kết quả JSON chấm điểm & feedback mẫu bài viết tốt hơn
    API->>DB: Lưu bài viết, điểm số từng tiêu chí & nhận xét vào bảng `writing_submissions`
    API-->>FE: Trả kết quả chấm thi dạng biểu đồ & nhận xét chi tiết
    FE->>User: Hiển thị điểm số band, sửa lỗi ngữ pháp & bài viết gợi ý nâng cấp
```

*   **Tiêu chí chấm điểm:** Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy, Overall Band.

---

### 3. Luồng Luyện Nói (Speaking Practice & AI Feedback Workflow)
*   **Thực hiện bài thi:** Người dùng nghe câu hỏi của giám khảo AI, bấm ghi âm nói câu trả lời.
*   **Chuyển giọng nói thành văn bản:** Trình duyệt sử dụng bộ nhận diện giọng nói hoặc API để dịch âm thanh thành chuỗi văn bản (`transcripts`).
*   **Chấm điểm:** Transcripts được nộp tới `/api/speaking/score`. AI đánh giá dựa trên: Fluency & Coherence, Lexical Resource, Grammatical Range, Pronunciation, và Overall Band. Kết quả lưu vào bảng `speaking_submissions`.

---

### 4. Luồng Luyện Đọc & Nghe (Reading & Listening Automatic Scoring Workflow)
*   **Luyện Đọc:** Giao diện chia đôi màn hình (bên trái hiển thị bài đọc, bên phải hiển thị bộ câu hỏi trắc nghiệm, điền từ, True/False/Not Given).
*   **Luyện Nghe:** Nghe tệp tin âm thanh trực quan qua thanh phát nhạc và làm bài tập câu hỏi ở khung bên cạnh.
*   **Chấm điểm tự động:** Đáp án được gửi về đầu cuối `/api/reading/submit` hoặc `/api/listening/submit`. Hệ thống tự so khớp đáp án của học sinh với đáp án đúng (`correctAnswer`) lưu sẵn trong bảng `reading_questions` / `listening_questions`. Điểm số được lưu tự động vào database.

---

### 5. Luồng Trò Chuyện Học Tập (AI Tutor Chat Workflow)
*   Tại trang `/chat`, người dùng gửi câu hỏi thắc mắc về kỹ năng IELTS, từ vựng hay ngữ pháp.
*   API `/api/chat` (edge runtime) dùng `streamChatText` để stream câu trả lời trực tiếp từ mô hình ngôn ngữ lớn (Groq) về màn hình dưới dạng tin nhắn thời gian thực của AI tutor có tên **hutechIELTShacker**.

---

## IV. Cấu Trúc Thư Mục Hệ Thống

Cấu trúc thư mục được sắp xếp khoa học theo kiến trúc Next.js App Router:

```
hutechIELTShacker/
├── public/
│   ├── images/               ← Tài nguyên ảnh tĩnh PNG của dự án
│   └── imgs/                 ← Chứa các file SVG biểu diễn thẻ kỹ năng & minh họa trang chủ
│       ├── writing.svg
│       ├── Reading.svg
│       ├── Listening.svg
│       ├── speaking.svg
│       └── examination.svg   ← Ảnh minh họa Landing Page mới
├── src/
│   ├── app/                  ← Next.js Pages & Route Handlers
│   │   ├── layout.tsx        ← Cấu hình thẻ Meta Title (hutechIELTShacker) & Font chữ
│   │   ├── page.tsx          ← Trang chủ giới thiệu hệ thống (Landing Page)
│   │   ├── (auth)/           ← Trang Đăng ký / Đăng nhập
│   │   ├── (app)/            ← Khu vực thực hành các kỹ năng của Học viên
│   │   │   ├── dashboard/    ← Bảng tổng quan học tập
│   │   │   ├── chat/         ← Trò chuyện trợ lý ảo AI Tutor
│   │   │   └── [writing/speaking/reading/listening] ← Các module luyện thi
│   │   ├── admin/            ← Trang Quản lý ngân hàng đề thi dành cho Admin
│   │   └── api/              ← Các endpoint phục vụ Auth, CRUD đề thi, và API chấm điểm AI
│   ├── components/
│   │   ├── layout/           ← Thành phần khung: Header, Sidebar điều hướng
│   │   ├── ui/               ← Thư viện UI nhỏ gọn (Button, Input, Card, Badge...)
│   │   └── [writing/speaking/reading/listening] ← Component đặc thù của từng kỹ năng
│   ├── lib/
│   │   ├── db/               ← Cấu hình MySQL & Drizzle Schema (schema.ts, seed.ts)
│   │   ├── auth.ts           ← Xử lý Hash mật khẩu (PBKDF2) & Sessions (JWT)
│   │   └── ai/               ← Chứa Prompt chấm điểm & Khởi tạo AI Client
│   └── hooks/                ← Các Custom hooks (useTimer, useSpeech...)
└── tailwind.config.ts        ← Cấu hình Theme & Màu sắc của dự án
```

---

## V. Giải Pháp Đồng Bộ Hóa Màu Sắc SVG Với Website Theme

Để tối ưu hóa giao diện thiết kế theo phong cách hiện đại và đồng bộ, hệ thống đã chuyển đổi toàn bộ thẻ kỹ năng và ảnh minh họa trang chủ từ dạng PNG sang dạng **SVG Vector**:
1.  Các file SVG được lưu trữ trong thư mục `/public/imgs/`.
2.  Màu sắc chính của ảnh SVG sử dụng thuộc tính:
    ```xml
    fill="var(--primary-svg-color)"
    ```
3.  Biến `--primary-svg-color` được ánh xạ trực tiếp tới biến màu `--primary` của hệ thống trong [globals.css](file:///Users/tranduyloc/Desktop/IELTS%20WEB/src/app/globals.css):
    ```css
    :root {
      --primary: 22 92% 50%; /* Màu cam đặc trưng của thương hiệu */
      --primary-svg-color: hsl(var(--primary));
    }
    ```
Nhờ cơ chế này, khi hệ thống thay đổi màu sắc chủ đạo (hoặc chuyển đổi Dark Mode/Light Mode), tất cả hình vẽ minh họa SVG sẽ tự động đổi màu tương ứng để đảm bảo trải nghiệm thị giác thống nhất và cao cấp nhất.
