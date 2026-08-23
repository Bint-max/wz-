"use client";

/**
 * 评论审核管理（卡哇伊版）
 */
import { useEffect, useState } from "react";
import { Check, Trash2, X, ShieldAlert, RotateCcw } from "lucide-react";
import { formatDateShort, cn } from "@/lib/utils";

type AdminComment = {
  id: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: "PENDING" | "APPROVED" | "SPAM" | "REJECTED";
  createdAt: string;
  post: { title: string; slug: string };
};

const tabs = [
  { key: "PENDING", label: "待审核" },
  { key: "APPROVED", label: "已通过" },
  { key: "SPAM", label: "垃圾" },
  { key: "REJECTED", label: "已拒绝" },
];

export function CommentManager() {
  const [tab, setTab] = useState("PENDING");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/comments?status=${tab}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setComments(d.data);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除这条评论吗？")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const badge: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    SPAM: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    REJECTED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="space-y-5">
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
      ) : comments.length === 0 ? (
        <p className="rounded-[1.5rem] border-2 border-dashed border-pink-100 py-16 text-center text-sm text-muted-foreground">
          暂无评论 ✿
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{c.authorName}</span>
                {c.authorEmail && (
                  <span className="text-xs text-muted-foreground">{c.authorEmail}</span>
                )}
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs", badge[c.status])}>
                  {c.status}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDateShort(c.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{c.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">来自：{c.post.title}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {c.status !== "APPROVED" && (
                  <button
                    onClick={() => updateStatus(c.id, "APPROVED")}
                    className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-xs text-white transition hover:opacity-90"
                  >
                    <Check className="h-3.5 w-3.5" /> 通过
                  </button>
                )}
                {c.status !== "SPAM" && (
                  <button
                    onClick={() => updateStatus(c.id, "SPAM")}
                    className="flex items-center gap-1 rounded-full border-2 border-pink-100 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-pink-50"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" /> 垃圾
                  </button>
                )}
                {c.status !== "REJECTED" && (
                  <button
                    onClick={() => updateStatus(c.id, "REJECTED")}
                    className="flex items-center gap-1 rounded-full border-2 border-pink-100 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-pink-50"
                  >
                    <X className="h-3.5 w-3.5" /> 拒绝
                  </button>
                )}
                {c.status !== "PENDING" && (
                  <button
                    onClick={() => updateStatus(c.id, "PENDING")}
                    className="flex items-center gap-1 rounded-full border-2 border-pink-100 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-pink-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> 待审
                  </button>
                )}
                <button
                  onClick={() => remove(c.id)}
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
