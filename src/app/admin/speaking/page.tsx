"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SpeakingTest {
  id: string;
  title: string;
  part: "part1" | "part2" | "part3";
  questions: string[];
  cueCard?: string;
  speakingTime: number;
  difficulty: "easy" | "medium" | "hard";
  isPublished: boolean;
}

export default function AdminSpeakingPage() {
  const [tests, setTests] = useState<SpeakingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<SpeakingTest & { questionsText: string }>>({
    part: "part1", difficulty: "medium", speakingTime: 300, isPublished: false, questionsText: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchTests() {
    try {
      const res = await fetch("/api/admin/speaking");
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTests();
  }, []);

  async function handleSave() {
    if (!form.title) return;
    const questions = (form.questionsText ?? "").split("\n").filter((q) => q.trim());
    const payload = {
      title: form.title ?? "",
      part: form.part ?? "part1",
      questions,
      cueCard: form.cueCard || null,
      speakingTime: Number(form.speakingTime) || 300,
      difficulty: form.difficulty ?? "medium",
      isPublished: form.isPublished ?? false,
    };

    try {
      if (editId) {
        const res = await fetch("/api/admin/speaking", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editId }),
        });
        if (res.ok) {
          fetchTests();
        }
      } else {
        const res = await fetch("/api/admin/speaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchTests();
        }
      }
      setShowForm(false);
      setEditId(null);
      setForm({ part: "part1", difficulty: "medium", speakingTime: 300, isPublished: false, questionsText: "" });
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(t: SpeakingTest) {
    setForm({ ...t, questionsText: t.questions.join("\n") });
    setEditId(t.id);
    setShowForm(true);
  }

  async function togglePublish(t: SpeakingTest) {
    try {
      const res = await fetch("/api/admin/speaking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...t, isPublished: !t.isPublished }),
      });
      if (res.ok) {
        fetchTests();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi Speaking này không?")) return;
    try {
      const res = await fetch(`/api/admin/speaking?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTests();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Speaking Tests</h1>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ part: "part1", difficulty: "medium", speakingTime: 300, isPublished: false, questionsText: "" }); }} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm đề thi
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">{editId ? "Chỉnh sửa" : "Thêm"} đề thi Speaking</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Tiêu đề</label>
                <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Part</label>
                <select className="w-full h-10 border border-input rounded-md px-3 text-sm"
                  value={form.part} onChange={(e) => setForm((f) => ({ ...f, part: e.target.value as "part1" | "part2" | "part3" }))}>
                  <option value="part1">Part 1</option>
                  <option value="part2">Part 2</option>
                  <option value="part3">Part 3</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Câu hỏi (mỗi câu 1 dòng)</label>
              <Textarea value={form.questionsText ?? ""} rows={4}
                onChange={(e) => setForm((f) => ({ ...f, questionsText: e.target.value }))}
                placeholder="Where are you from?&#10;What do you do for work?&#10;..." />
            </div>
            {form.part === "part2" && (
              <div>
                <label className="text-sm font-medium block mb-1">Cue Card (Part 2)</label>
                <Textarea value={form.cueCard ?? ""} rows={3}
                  onChange={(e) => setForm((f) => ({ ...f, cueCard: e.target.value }))} />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSave}>Lưu</Button>
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
          {tests.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{t.title}</span>
                    <Badge variant="secondary">{t.part.toUpperCase()}</Badge>
                    <Badge variant={t.isPublished ? "success" : "outline"}>{t.isPublished ? "Đã đăng" : "Nháp"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.questions.length} câu hỏi</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => togglePublish(t)}>
                    {t.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tests.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Chưa có đề thi Speaking nào. Bấm nút Thêm để bắt đầu.</p>
          )}
        </div>
      )}
    </div>
  );
}
