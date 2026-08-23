"use client";

/**
 * 站点设置表单（卡哇伊版）
 */
import { useState } from "react";
import { Save } from "lucide-react";
import { useSettings } from "@/client/hooks/useSettings";

const fields = [
  { key: "site_name", label: "站点名称" },
  { key: "site_title", label: "SEO 标题" },
  { key: "site_description", label: "站点描述" },
  { key: "avatar", label: "头像 URL" },
  { key: "bio", label: "个人简介" },
  { key: "github", label: "GitHub 链接" },
  { key: "email", label: "联系邮箱" },
];

export function SettingsForm() {
  const { settings, setSettings, loading, error, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateSettings(settings);
      setMessage("保存成功 ✿");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">加载中...</p>;
  }

  if (error) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{error}</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="mb-1 block text-sm font-medium">{field.label}</label>
          {field.key === "site_description" || field.key === "bio" ? (
            <textarea
              value={settings[field.key] ?? ""}
              onChange={(e) => setSettings((v) => ({ ...v, [field.key]: e.target.value }))}
              rows={3}
              className={inputCls}
            />
          ) : (
            <input
              value={settings[field.key] ?? ""}
              onChange={(e) => setSettings((v) => ({ ...v, [field.key]: e.target.value }))}
              className={inputCls}
            />
          )}
        </div>
      ))}

      <div className="flex items-center gap-3">
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
  );
}
