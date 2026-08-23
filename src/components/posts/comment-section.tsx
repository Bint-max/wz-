"use client";

/**
 * 文章评论系统
 * - 展示已审核评论
 * - 提交新评论（进入待审核状态）
 */
import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { CommentItem } from "@/types";

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
      setMessage("评论已提交，审核通过后将展示，感谢你的留言！");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 rounded-2xl border bg-card p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5" /> 评论（{comments.length}）
      </h2>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="昵称 *"
            maxLength={50}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="邮箱（选填，不会公开）"
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的想法..."
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {message ?? "文明发言，垃圾评论会被自动拦截。"}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {submitting ? "提交中..." : "提交评论"}
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-5">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">还没有评论，来抢沙发吧～</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="border-t pt-5 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
                {comment.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium">{comment.authorName}</p>
                <time className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </time>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
