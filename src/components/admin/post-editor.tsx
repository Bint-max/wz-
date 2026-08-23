"use client";

/**
 * 文章编辑器：Markdown 编辑 + 实时预览 + 分类/标签/封面设置
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, PenLine, Plus } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { UploadButton } from "./upload-button";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

export type EditorPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  featured: boolean;
  categoryId: string;
  tagIds: string[];
  publishedAt: string;
};

const emptyPost: EditorPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "# 标题\n\n开始撰写你的文章...",
  coverImage: "",
  published: false,
  featured: false,
  categoryId: "",
  tagIds: [],
  publishedAt: "",
};

export function PostEditor({ initial }: { initial?: EditorPost }) {
  const router = useRouter();
  const [post, setPost] = useState<EditorPost>(initial ?? emptyPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isEdit = Boolean(post.id);

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/tags")])
      .then(async ([c, t]) => {
        const cd = await c.json();
        const td = await t.json();
        if (cd.success) setCategories(cd.data);
        if (td.success) setTags(td.data);
      })
      .catch(() => {});
  }, []);

  const preview = useMemo(() => post.content, [post.content]);

  const set = <K extends keyof EditorPost>(key: K, value: EditorPost[K]) =>
    setPost((p) => ({ ...p, [key]: value }));

  const toggleTag = (id: string) => {
    setPost((p) => ({
      ...p,
      tagIds: p.tagIds.includes(id) ? p.tagIds.filter((t) => t !== id) : [...p.tagIds, id],
    }));
  };

  const addTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setTags((prev) => [...prev, data.data]);
      setPost((p) => ({ ...p, tagIds: [...p.tagIds, data.data.id] }));
      setNewTag("");
    } else {
      alert(data.error ?? "创建标签失败");
    }
  };

  const onSave = async (publish: boolean) => {
    setSaving(true);
    setMessage("");
    const payload = {
      title: post.title,
      slug: post.slug || undefined,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || "",
      published: publish,
      featured: post.featured,
      categoryId: post.categoryId || null,
      tagIds: post.tagIds,
      publishedAt: publish ? post.publishedAt || new Date().toISOString() : null,
    };

    try {
      const res = await fetch(post.id ? `/api/posts/${post.id}` : "/api/posts", {
        method: post.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存失败");
      setMessage("已保存");
      if (publish) {
        router.push("/admin/posts");
        router.refresh();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const labelCls = "mb-1 block text-sm font-medium";
  const inputCls =
    "w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-cute text-2xl font-bold">{isEdit ? "编辑文章" : "新建文章"}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(false)}
            disabled={saving}
            className="rounded-full border-2 border-pink-100 px-4 py-2 text-sm text-muted-foreground transition hover:bg-pink-50 disabled:opacity-50"
          >
            存草稿
          </button>
          <button
            onClick={() => onSave(true)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03] disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "保存中..." : "发布"}
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* 左侧：内容编辑 */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>标题</label>
            <input
              value={post.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="文章标题"
              className={cn(inputCls, "text-base font-medium")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Slug（留空自动生成）</label>
              <input
                value={post.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="article-slug"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>摘要</label>
              <input
                value={post.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="一句话描述文章"
                className={inputCls}
              />
            </div>
          </div>

          {/* 编辑/预览切换 */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-1 border-b px-2 pt-2">
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
                <Eye className="h-4 w-4" /> 实时预览
              </button>
            </div>
            {tab === "edit" ? (
              <textarea
                value={post.content}
                onChange={(e) => set("content", e.target.value)}
                rows={18}
                className="w-full resize-y bg-transparent p-4 font-mono text-sm outline-none"
                placeholder="支持 Markdown 语法..."
              />
            ) : (
              <div className="min-h-[420px] p-4">
                <Markdown content={preview} />
              </div>
            )}
          </div>
        </div>

        {/* 右侧：发布设置 */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">发布设置</h2>
            <label className="mb-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={post.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4"
              />
              立即发布
            </label>
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={post.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4"
              />
              设为精选
            </label>
            <label className={labelCls}>发布时间</label>
            <input
              type="datetime-local"
              value={post.publishedAt ? post.publishedAt.slice(0, 16) : ""}
              onChange={(e) =>
                set("publishedAt", e.target.value ? new Date(e.target.value).toISOString() : "")
              }
              className={inputCls}
            />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">分类</h2>
            <select
              value={post.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
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

          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">封面图</h2>
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt="封面预览"
                className="mb-3 aspect-[16/9] w-full rounded-lg object-cover"
              />
            )}
            <div className="flex gap-2">
              <input
                value={post.coverImage}
                onChange={(e) => set("coverImage", e.target.value)}
                placeholder="图片 URL"
                className={inputCls}
              />
            </div>
            <div className="mt-2">
              <UploadButton onUploaded={(url) => set("coverImage", url)} />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">标签</h2>
            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="新建标签"
                className={inputCls}
              />
              <button
                onClick={addTag}
                className="flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = post.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      active
                        ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
