"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Question {
  id?: string;
  type: string;
  question: string;
  optionsText?: string; // newline separated options
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface ReadingPassage {
  id: string;
  title: string;
  passage: string;
  timeMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  isPublished: boolean;
  questions?: Question[];
}

export default function AdminReadingPage() {
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ReadingPassage>>({ difficulty: "medium", timeMinutes: 20, isPublished: false });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchPassages() {
    try {
      const res = await fetch("/api/admin/reading");
      if (res.ok) {
        const data = await res.json();
        setPassages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPassages();
  }, []);

  async function handleSave() {
    if (!form.title || !form.passage) return;

    // Process questions options
    const processedQuestions = questions.map((q) => {
      const options = q.optionsText
        ? q.optionsText.split("\n").filter((o) => o.trim())
        : q.options;
      return {
        type: q.type,
        question: q.question,
        options: options && options.length > 0 ? options : null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
      };
    });

    const payload = {
      title: form.title,
      passage: form.passage,
      difficulty: form.difficulty ?? "medium",
      timeMinutes: Number(form.timeMinutes) || 20,
      isPublished: form.isPublished ?? false,
      questions: processedQuestions,
    };

    try {
      if (editId) {
        const res = await fetch("/api/admin/reading", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editId }),
        });
        if (res.ok) fetchPassages();
      } else {
        const res = await fetch("/api/admin/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) fetchPassages();
      }
      setShowForm(false);
      setEditId(null);
      setForm({ difficulty: "medium", timeMinutes: 20, isPublished: false });
      setQuestions([]);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(p: ReadingPassage) {
    setForm(p);
    setEditId(p.id);
    const qs = (p.questions || []).map((q) => ({
      ...q,
      optionsText: q.options ? q.options.join("\n") : "",
    }));
    setQuestions(qs);
    setShowForm(true);
  }

  async function togglePublish(p: ReadingPassage) {
    try {
      const res = await fetch("/api/admin/reading", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, isPublished: !p.isPublished }),
      });
      if (res.ok) fetchPassages();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đọc này không? Toàn bộ câu hỏi cũng sẽ bị xóa.")) return;
    try {
      const res = await fetch(`/api/admin/reading?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchPassages();
    } catch (err) {
      console.error(err);
    }
  }

  function addQuestionField() {
    setQuestions((prev) => [...prev, { type: "multiple_choice", question: "", optionsText: "", correctAnswer: "" }]);
  }

  function removeQuestionField(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQuestionField(idx: number, key: keyof Question, val: any) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [key]: val } : q))
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Reading Passages</h1>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ difficulty: "medium", timeMinutes: 20, isPublished: false }); setQuestions([]); }} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm bài đọc
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">{editId ? "Chỉnh sửa" : "Thêm"} bài đọc</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium block mb-1">Tiêu đề</label>
                <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Độ khó</label>
                <select className="w-full h-10 border border-input rounded-md px-3 text-sm"
                  value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as "easy" | "medium" | "hard" }))}>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Thời gian (phút)</label>
                <Input type="number" value={form.timeMinutes ?? 20} onChange={(e) => setForm((f) => ({ ...f, timeMinutes: Number(e.target.value) }))} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium block mb-1">Đoạn văn</label>
                <Textarea value={form.passage ?? ""} rows={6} onChange={(e) => setForm((f) => ({ ...f, passage: e.target.value }))} />
              </div>
            </div>

            {/* Questions section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Danh sách câu hỏi</h3>
                <Button type="button" variant="outline" size="sm" onClick={addQuestionField} className="gap-1">
                  <Plus className="w-3 h-3" /> Thêm câu hỏi
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="border p-4 rounded-lg bg-gray-50 space-y-3 relative">
                    <button type="button" onClick={() => removeQuestionField(idx)} className="absolute right-2 top-2 text-xs text-red-500 hover:underline">
                      Xóa câu
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-semibold block mb-1">Câu hỏi {idx + 1}</label>
                        <Input value={q.question} onChange={(e) => updateQuestionField(idx, "question", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold block mb-1">Dạng câu hỏi</label>
                        <select className="w-full h-10 border border-input rounded-md px-3 text-sm bg-white"
                          value={q.type} onChange={(e) => updateQuestionField(idx, "type", e.target.value)}>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="true_false_not_given">True/False/Not Given</option>
                          <option value="matching">Matching</option>
                          <option value="fill_blank">Fill in the Blank</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold block mb-1">Đáp án đúng</label>
                        <Input value={q.correctAnswer} onChange={(e) => updateQuestionField(idx, "correctAnswer", e.target.value)} placeholder="VD: B hoặc True hoặc 1991" />
                      </div>
                      {q.type === "multiple_choice" && (
                        <div className="col-span-2">
                          <label className="text-xs font-semibold block mb-1">Các lựa chọn (mỗi dòng 1 lựa chọn)</label>
                          <Textarea value={q.optionsText ?? ""} rows={3} onChange={(e) => updateQuestionField(idx, "optionsText", e.target.value)} placeholder="A. Lựa chọn 1&#10;B. Lựa chọn 2&#10;..." className="bg-white" />
                        </div>
                      )}
                      <div className="col-span-2">
                        <label className="text-xs font-semibold block mb-1">Giải thích đáp án</label>
                        <Input value={q.explanation ?? ""} onChange={(e) => updateQuestionField(idx, "explanation", e.target.value)} placeholder="Giải thích chi tiết của AI" className="bg-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 border-t pt-4">
              <Button onClick={handleSave}>Lưu bài đọc</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {passages.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{p.title}</span>
                    <Badge variant={p.isPublished ? "success" : "outline"}>{p.isPublished ? "Đã đăng" : "Nháp"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{(p.questions || []).length} câu hỏi · {p.timeMinutes} phút · Độ khó: {p.difficulty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => togglePublish(p)}>
                    {p.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {passages.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Chưa có bài đọc nào. Bấm nút Thêm để bắt đầu.</p>
          )}
        </div>
      )}
    </div>
  );
}
