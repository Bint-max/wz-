"use client";

/**
 * 分类管理
 */
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { posts: number };
};

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const load = () =>
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => d.success && setCategories(d.data));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (res.ok) {
      setName("");
      setDescription("");
      load();
    } else {
      alert(data.error ?? "创建失败");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const res = await fetch(`/api/categories/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc, sortOrder: editing.sortOrder }),
    });
    const data = await res.json();
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      alert(data.error ?? "更新失败");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除该分类吗？其下文章将变为未分类。")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">新增分类</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="分类名称"
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述（可选）"
            className="min-w-[200px] flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={add}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> 添加
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-4">
            {editing?.id === c.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="min-w-[200px] flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button onClick={saveEdit} className="rounded-lg p-2 text-green-600 hover:bg-muted">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{c.slug} · {c._count.posts} 篇文章 · {c.description ?? "暂无描述"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditing(c);
                    setEditName(c.name);
                    setEditDesc(c.description ?? "");
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
