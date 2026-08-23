"use client";

/**
 * 后台文章列表表格（卡哇伊版，支持删除）
 */
import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

type AdminPost = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  category: { name: string } | null;
};

export function PostTable({ initial }: { initial: AdminPost[] }) {
  const [posts, setPosts] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  const onDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？此操作不可恢复。")) return;
    setDeleting(id);
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("删除失败，请重试");
    }
    setDeleting(null);
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border-2 border-white/70 bg-card/90 shadow-soft dark:border-white/10">
      <div className="flex items-center justify-between border-b border-pink-100 p-4 dark:border-white/10">
        <h2 className="font-cute font-semibold">文章列表（{posts.length}）</h2>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03]"
        >
          <Plus className="h-4 w-4" /> 新建文章
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pink-100 text-left text-xs text-muted-foreground dark:border-white/10">
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">阅读</th>
              <th className="px-4 py-3 font-medium">发布时间</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-pink-50 last:border-b-0 hover:bg-pink-50/50 dark:border-white/5 dark:hover:bg-white/5">
                <td className="max-w-[280px] px-4 py-3">
                  <Link href={`/admin/posts/${post.id}/edit`} className="line-clamp-1 font-medium hover:text-primary">
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{post.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {post.published ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-700 dark:bg-green-950/50 dark:text-green-300">
                      ✓ 已发布
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                      ✎ 草稿
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{post.views}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {post.publishedAt ? formatDateShort(post.publishedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="rounded-full p-2 text-muted-foreground transition hover:bg-pink-100 hover:text-pink-500"
                      aria-label="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(post.id)}
                      disabled={deleting === post.id}
                      className="rounded-full p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                      aria-label="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
