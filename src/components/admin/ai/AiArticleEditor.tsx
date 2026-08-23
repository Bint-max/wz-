"use client";

/**
 * AI 文章编辑器：审核、修改、发布
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Eye, PenLine, ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export function AiArticleEditor({ id }: { id: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tags, setTags] = useState("");
  const [suggestedCategoryId, setSuggestedCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<string>("DRAFT");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([fetch(`/api/admin/ai/articles/${id}`), fetch("/api/categories")])
      .then(async ([a, c]) => {
        const ad = await a.json();
        const cd = await c.json();
        if (ad.success) {
          const article = ad.data;
          setTitle(article.title);
          setSummary(article.summary ?? "");
          setContent(article.content);
          setKeywords((article.keywords ?? []).join(", "));
          setTags((article.tags ?? []).join(", "));
          setSuggestedCategoryId(article.suggestedCategoryId ?? "");
          setStatus(article.status);
          setSourceUrl(article.sourceUrl ?? "");
        }
        if (cd.success) setCategories(cd.data);
      })
      .catch(() => {});
  }, [id]);

  const preview = useMemo(() => content, [content]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/ai/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          content,
          keywords: keywords.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
          tags: tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
          suggestedCategoryId: suggestedCategoryId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存失败");
      setMessage("已保存 ✿");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!confirm("确定发布这篇文章到博客吗？")) return;
    setPublishing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/articles/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "发布失败");
      setStatus("PUBLISHED");
      setMessage("发布成功 ✿");
      router.push("/admin/ai-articles");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "发布失败");
    } finally {
      setPublishing(false);
    }
  };

  const inputCls =
    "w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/admin/ai-articles")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full border-2 border-pink-100 px-4 py-2 text-sm text-muted-foreground transition hover:bg-pink-50 disabled:opacity-50"
          >
            <Save className="mr-1 inline h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </button>
          {status !== "PUBLISHED" && (
            <button
              onClick={publish}
              disabled={publishing}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03] disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {publishing ? "发布中..." : "发布"}
            </button>
          )}
        </div>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">摘要</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className={inputCls}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-pink-100 bg-card dark:border-pink-500/20">
            <div className="flex items-center gap-1 border-b border-pink-100 px-2 pt-2 dark:border-pink-500/20">
              <button
                onClick={() => setTab("edit")}
                className={cn(
                  "flex items-center gap-1.5 rounded-t-2xl px-3 py-2 text-sm transition",
                  tab === "edit" ? "bg-pink-100 font-medium text-pink-600 dark:bg-pink-500/20" : "text-muted-foreground",
                )}
              >
                <PenLine className="h-4 w-4" /> 编辑
              </button>
              <button
                onClick={() => setTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 rounded-t-2xl px-3 py-2 text-sm transition",
                  tab === "preview" ? "bg-pink-100 font-medium text-pink-600 dark:bg-pink-500/20" : "text-muted-foreground",
                )}
              >
                <Eye className="h-4 w-4" /> 预览
              </button>
            </div>
            {tab === "edit" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                className="w-full resize-y bg-transparent p-4 font-mono text-sm outline-none"
              />
            ) : (
              <div className="min-h-[420px] p-4">
                <Markdown content={preview} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
            <label className="mb-1 block text-sm font-medium">推荐分类</label>
            <select
              value={suggestedCategoryId}
              onChange={(e) => setSuggestedCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">未分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
            <label className="mb-1 block text-sm font-medium">关键词（逗号分隔）</label>
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputCls} />
          </div>

          <div className="rounded-2xl border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
            <label className="mb-1 block text-sm font-medium">标签（逗号分隔）</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} />
          </div>

          {sourceUrl && (
            <div className="rounded-2xl border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
              <label className="mb-1 block text-sm font-medium">来源链接</label>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-primary underline">
                {sourceUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
