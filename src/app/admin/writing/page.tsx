"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface WritingTest {
  id: string;
  title: string;
  task: "task1" | "task2";
  prompt: string;
  timeMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  isPublished: boolean;
}

export default function AdminWritingPage() {
  const [tests, setTests] = useState<WritingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<WritingTest>>({ task: "task1", difficulty: "medium", timeMinutes: 20, isPublished: false });
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchTests() {
    try {
      const res = await fetch("/api/admin/writing");
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
    if (!form.title || !form.prompt) return;

    try {
      if (editId) {
        const res = await fetch("/api/admin/writing", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editId }),
        });
        if (res.ok) {
          fetchTests();
        }
      } else {
        const res = await fetch("/api/admin/writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          fetchTests();
        }
      }
      setShowForm(false);
      setEditId(null);
      setForm({ task: "task1", difficulty: "medium", timeMinutes: 20, isPublished: false });
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(t: WritingTest) {
    setForm(t);
    setEditId(t.id);
    setShowForm(true);
  }

  async function togglePublish(t: WritingTest) {
    try {
      const res = await fetch("/api/admin/writing", {
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
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi này không?")) return;
    try {
      const res = await fetch(`/api/admin/writing?id=${id}`, {
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
        <h1 className="text-2xl font-bold">Quản lý Writing Tests</h1>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ task: "task1", difficulty: "medium", timeMinutes: 20, isPublished: false }); }} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm đề thi
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">{editId ? "Chỉnh sửa" : "Thêm"} đề thi</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Tiêu đề</label>
                <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Task</label>
                <select
                  className="w-full h-10 border border-input rounded-md px-3 text-sm"
                  value={form.task}
                  onChange={(e) => setForm((f) => ({ ...f, task: e.target.value as "task1" | "task2" }))}
                >
                  <option value="task1">Task 1</option>
                  <option value="task2">Task 2</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Độ khó</label>
                <select
                  className="w-full h-10 border border-input rounded-md px-3 text-sm"
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as "easy" | "medium" | "hard" }))}
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Thời gian (phút)</label>
                <Input type="number" value={form.timeMinutes ?? 40}
                  onChange={(e) => setForm((f) => ({ ...f, timeMinutes: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Đề bài / Prompt</label>
              <Textarea value={form.prompt ?? ""} rows={4}
                onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))} />
            </div>
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
                    <Badge variant="secondary">{t.task === "task1" ? "Task 1" : "Task 2"}</Badge>
                    <Badge variant={t.isPublished ? "success" : "outline"}>
                      {t.isPublished ? "Đã đăng" : "Nháp"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{t.prompt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => togglePublish(t)}>
                    {t.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tests.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Chưa có đề thi nào. Bấm nút Thêm để bắt đầu.</p>
          )}
        </div>
      )}
    </div>
  );
}
