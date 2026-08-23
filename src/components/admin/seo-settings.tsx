"use client";

/**
 * SEO 配置（卡哇伊版）
 */
import { useState } from "react";
import { Save, Trash2, Globe } from "lucide-react";
import { useSeo } from "@/client/hooks/useSeo";

export function SeoSettings() {
  const { site, items, loading, error, updateSite, deleteMeta } = useSeo();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonical, setCanonical] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 初始化表单
  const [initialized, setInitialized] = useState(false);
  if (site && !initialized) {
    setTitle(site.title ?? "");
    setDescription(site.description ?? "");
    setKeywords((site.keywords ?? []).join(", "));
    setOgImage(site.ogImage ?? "");
    setCanonical(site.canonical ?? "");
    setInitialized(true);
  }

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateSite({
        title,
        description,
        keywords: keywords.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        ogImage,
        canonical,
      });
      setMessage("保存成功 ✿");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

  if (loading) return <p className="py-16 text-center text-sm text-muted-foreground">加载中...</p>;
  if (error) return <p className="py-16 text-center text-sm text-muted-foreground">{error}</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
        <h2 className="font-cute flex items-center gap-2 text-base font-semibold">
          <Globe className="h-4 w-4 text-sky-400" /> 站点级 SEO
        </h2>
        <div className="mt-3 grid gap-3">
          <div>
            <label className="mb-1 block text-sm">SEO 标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm">SEO 描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm">关键词（逗号分隔）</label>
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm">OG 图片 URL</label>
            <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Canonical URL</label>
            <input value={canonical} onChange={(e) => setCanonical(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="cute-btn-pop flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03] disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "保存中..." : "保存设置"}
          </button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      </div>

      {items.length > 0 && (
        <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
          <h3 className="font-cute mb-3 text-base font-semibold">实体级 SEO 覆盖</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-muted/60 px-3 py-2 text-sm">
                <span className="text-xs text-muted-foreground">{item.entityType}/{item.entityId}</span>
                <span className="flex-1 truncate">{item.title ?? "未命名"}</span>
                <button
                  onClick={() => deleteMeta(item.id)}
                  className="rounded-full p-1 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
