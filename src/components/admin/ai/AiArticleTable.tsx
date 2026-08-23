"use client";

/**
 * AI 文章审核列表
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Send } from "lucide-react";
import { formatDateShort, cn } from "@/lib/utils";

type AiArticleItem = {
  id: string;
  title: string;
  summary: string | null;
  status: number;
  model: string | null;
  createdAt: string;
  tags: string[];
  category: { name: string } | null;
  newsItem: { title: string } | null;
  post: { slug: string } | null;
};

const tabs = [
  { key: "", label: "全部" },
  { key: "0", label: "草稿" },
  { key: "1", label: "已发布" },
];

export function AiArticleTable() {
  const [tab, setTab] = useState("0");
  const [items, setItems] = useState<AiArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (status: string) => {
    setLoading(true);
    const query = status === "" ? "" : `?status=${status}`;
    const res = await fetch(`/api/admin/ai/articles${query}`);
    const data = await res.json();
    if (data.success) setItems(data.data.items);
    setLoading(false);
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const publish = async (id: string) => {
    if (!confirm("确定发布这篇文章到博客吗？")) return;
    const res = await fetch("/api/admin/articles/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("发布成功 ✿");
      load(tab);
    } else {
      alert(data.error ?? "发布失败");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除这篇 AI 文章吗？")) return;
    const res = await fetch(`/api/admin/ai/articles/${id}`, { method: "DELETE" });
    if (res.ok) load(tab);
    else alert("删除失败");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition",
              tab === t.key
                ? "bg-gradient-to-r from-pink-400 to-violet-400 font-medium text-white shadow-soft"
                : "bg-card/90 text-muted-foreground hover:bg-pink-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">加载中...</p>
      ) : items.length === 0 ? (
        <p className="rounded-[1.5rem] border-2 border-dashed border-pink-100 py-16 text-center text-sm text-muted-foreground">
          暂无 AI 文章，先采集新闻并生成吧 ✿
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs",
                    item.status === 1
                      ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
                  )}
                >
                  {item.status === 1 ? "已发布" : "草稿"}
                </span>
                {item.category && (
                  <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs text-pink-500">
                    {item.category.name}
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDateShort(item.createdAt)}
                </span>
              </div>

              <Link
                href={`/admin/ai-articles/${item.id}/edit`}
                className="mt-2 block font-medium leading-snug hover:text-primary"
              >
                {item.title}
              </Link>
              {item.newsItem && (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  来源新闻：{item.newsItem.title}
                </p>
              )}
              {item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/admin/ai-articles/${item.id}/edit`}
                  className="flex items-center gap-1 rounded-full border-2 border-pink-100 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-pink-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> 编辑
                </Link>
                {item.status !== 1 && (
                  <button
                    onClick={() => publish(item.id)}
                    className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-3 py-1.5 text-xs text-white shadow-soft transition hover:opacity-90"
                  >
                    <Send className="h-3.5 w-3.5" /> 发布
                  </button>
                )}
                <button
                  onClick={() => remove(item.id)}
                  className="ml-auto flex items-center gap-1 rounded-full border-2 border-red-100 px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-50 dark:border-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" /> 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
