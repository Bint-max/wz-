"use client";

/**
 * 文章评论系统（卡哇伊版）
 * - 展示已审核评论
 * - 提交新评论（进入待审核状态）
 */
import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { CommentItem } from "@/types";
import { CuteButton } from "@/components/ui/CuteButton";

export function CommentSection({
  postId,
  comments,
}: {
  postId: string;
  comments: CommentItem[];
}) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, authorEmail, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "提交失败");
      setContent("");
      setAuthorEmail("");
      setMessage("评论已提交，审核通过后将展示，感谢你的留言！💗");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 rounded-[1.75rem] border-2 border-white/70 bg-card/90 p-6 shadow-soft dark:border-white/10">
      <h2 className="font-cute flex items-center gap-2 text-xl font-bold">
        <MessageSquare className="h-5 w-5 text-pink-400" /> 评论（{comments.length}）
      </h2>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="昵称 *"
            maxLength={50}
            className="rounded-2xl border-2 border-pink-100 bg-background/70 px-4 py-2.5 text-sm outline-none transition focus:border-pink-300 dark:border-pink-500/20"
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="邮箱（选填，不会公开）"
            className="rounded-2xl border-2 border-pink-100 bg-background/70 px-4 py-2.5 text-sm outline-none transition focus:border-pink-300 dark:border-pink-500/20"
          />
        </div>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的想法... ✧"
          rows={4}
          maxLength={2000}
          className="w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-4 py-2.5 text-sm outline-none transition focus:border-pink-300 dark:border-pink-500/20"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {message ?? "文明发言，垃圾评论会被自动拦截 ✿"}
          </p>
          <CuteButton type="submit" disabled={submitting}>
            <Send className="h-4 w-4" /> {submitting ? "提交中..." : "提交评论"}
          </CuteButton>
        </div>
      </form>

      <div className="mt-8 space-y-5">
        {comments.length === 0 && (
          <p className="rounded-2xl bg-pink-50/60 py-8 text-center text-sm text-muted-foreground">
            还没有评论，来抢沙发吧～ 🍓
          </p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-2xl border-2 border-dashed border-pink-100 bg-background/50 p-4 dark:border-pink-500/20"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-violet-200 text-sm font-bold text-white">
                {comment.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium">{comment.authorName}</p>
                <time className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <span className="ml-auto text-lg opacity-60">💗</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
