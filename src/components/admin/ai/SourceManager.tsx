"use client";

/**
 * 新闻来源配置（卡哇伊版）
 * 支持一键添加 RSSHub 热门渠道模板
 */
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Wand2 } from "lucide-react";

type NewsSource = {
  id: string;
  name: string;
  type: "RSS" | "API";
  url: string;
  enabled: boolean;
  newsType: string | null;
  defaultTags: string[];
  config: Record<string, unknown> | null;
  lastFetchedAt: string | null;
};

const empty = {
  name: "",
  type: "RSS" as "RSS" | "API",
  url: "",
  enabled: true,
  newsType: "",
  defaultTags: "",
  configText: "",
};

export function SourceManager({ rsshubBaseUrl = "https://rsshub.app" }: { rsshubBaseUrl?: string }) {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const load = () =>
    fetch("/api/admin/ai/sources")
      .then((r) => r.json())
      .then((d) => d.success && setSources(d.data));

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async () => {
    let config: Record<string, unknown> | null = null;
    if (form.configText.trim()) {
      try {
        config = JSON.parse(form.configText);
      } catch {
        alert("config 不是合法 JSON");
        return;
      }
    }

    const payload = {
      name: form.name,
      type: form.type,
      url: form.url,
      enabled: form.enabled,
      newsType: form.newsType || null,
      defaultTags: form.defaultTags.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      config,
    };

    const res = await fetch(editingId ? `/api/admin/ai/sources/${editingId}` : "/api/admin/ai/sources", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      reset();
      load();
    } else {
      alert(data.error ?? "保存失败");
    }
  };

  const startEdit = (s: NewsSource) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      type: s.type,
      url: s.url,
      enabled: s.enabled,
      newsType: s.newsType ?? "",
      defaultTags: (s.defaultTags ?? []).join(", "),
      configText: s.config ? JSON.stringify(s.config) : "",
    });
  };

  const toggle = async (s: NewsSource) => {
    await fetch(`/api/admin/ai/sources/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !s.enabled }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除该来源吗？其下已采集的新闻也会被删除。")) return;
    await fetch(`/api/admin/ai/sources/${id}`, { method: "DELETE" });
    load();
  };

  /** 一键添加 RSSHub 热门渠道 */
  const addTemplate = async (t: { name: string; url: string; newsType: string; tags: string[] }) => {
    setAdding(t.name);
    const exists = sources.some((s) => s.name === t.name);
    if (exists) {
      alert(`${t.name} 已存在，无需重复添加`);
      setAdding(null);
      return;
    }
    const res = await fetch("/api/admin/ai/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: t.name,
        type: "RSS",
        url: `${rsshubBaseUrl}${t.url}`,
        enabled: true,
        newsType: t.newsType,
        defaultTags: t.tags,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      load();
    } else {
      alert(data.error ?? `添加 ${t.name} 失败`);
    }
    setAdding(null);
  };

  const TEMPLATES = [
    { name: "微博热搜", url: "/weibo/search/hot", newsType: "热点", tags: ["微博", "热搜"] },
    { name: "知乎热榜", url: "/zhihu/hotlist", newsType: "热点", tags: ["知乎"] },
    { name: "央视新闻", url: "/cctv/news", newsType: "要闻", tags: ["央视"] },
  ];

  const inputCls =
    "rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

  return (
    <div className="space-y-5">
      {/* RSSHub 热门渠道模板 */}
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
        <h2 className="font-cute mb-1 flex items-center gap-2 text-base font-semibold">
          <Wand2 className="h-4 w-4 text-pink-400" /> 一键添加热门渠道（RSSHub）
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          当前 RSSHub 地址：<code className="rounded bg-muted px-1">{rsshubBaseUrl}</code>
          （可用环境变量 <code className="rounded bg-muted px-1">RSSHUB_BASE_URL</code> 换成自建实例）
        </p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => addTemplate(t)}
              disabled={adding !== null}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> {adding === t.name ? "添加中..." : t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
        <h2 className="font-cute mb-3 text-base font-semibold">
          {editingId ? "编辑来源" : "自定义来源"}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="来源名称" className={inputCls} />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="RSS/API 地址（可省略 https://）" className={inputCls} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "RSS" | "API" })} className={inputCls}>
            <option value="RSS">RSS</option>
            <option value="API">API</option>
          </select>
          <input value={form.newsType} onChange={(e) => setForm({ ...form, newsType: e.target.value })} placeholder="新闻类型（如 科技/财经/体育）" className={inputCls} />
          <input value={form.defaultTags} onChange={(e) => setForm({ ...form, defaultTags: e.target.value })} placeholder="默认标签（逗号分隔）" className={inputCls} />
          <input value={form.configText} onChange={(e) => setForm({ ...form, configText: e.target.value })} placeholder="config JSON（可选）" className={inputCls} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="h-4 w-4" />
            启用
          </label>
          <button
            onClick={submit}
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03]"
          >
            {editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "保存修改" : "添加来源"}
          </button>
          {editingId && (
            <button onClick={reset} className="flex items-center gap-1 rounded-full border-2 border-pink-100 px-4 py-2 text-sm text-muted-foreground hover:bg-pink-50">
              <X className="h-4 w-4" /> 取消
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sources.map((s) => (
          <div key={s.id} className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-violet-200 text-base">
                {s.type === "RSS" ? "📡" : "🔌"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{s.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${s.enabled ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300" : "bg-gray-100 text-gray-500"}`}>
                    {s.enabled ? "启用" : "停用"}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{s.url}</p>
                {s.newsType && (
                  <span className="mt-0.5 inline-block rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-500">
                    {s.newsType}
                  </span>
                )}
                {s.lastFetchedAt && (
                  <p className="text-xs text-muted-foreground">上次采集：{new Date(s.lastFetchedAt).toLocaleString("zh-CN")}</p>
                )}
              </div>
              <button onClick={() => toggle(s)} className="rounded-full p-2 text-muted-foreground hover:bg-pink-100 hover:text-pink-500" title="启用/停用">
                {s.enabled ? "⏸" : "▶"}
              </button>
              <button onClick={() => startEdit(s)} className="rounded-full p-2 text-muted-foreground hover:bg-pink-100 hover:text-pink-500" title="编辑">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(s.id)} className="rounded-full p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40" title="删除">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {sources.length === 0 && (
          <p className="rounded-[1.5rem] border-2 border-dashed border-pink-100 py-12 text-center text-sm text-muted-foreground">
            还没有新闻来源，可以点上面「一键添加热门渠道」，或手动添加 ✿
          </p>
        )}
      </div>
    </div>
  );
}
