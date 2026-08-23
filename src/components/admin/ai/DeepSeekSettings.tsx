"use client";

/**
 * DeepSeek 配置表单（后台维护，无需改 .env）
 */
import { useEffect, useState } from "react";
import { Save, KeyRound, Cpu, Link2 } from "lucide-react";

export function DeepSeekSettings() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com");
  const [masked, setMasked] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setModel(d.data.model);
          setBaseUrl(d.data.baseUrl);
          setMasked(d.data.apiKeyMasked);
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey || undefined,
          model,
          baseUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存失败");
      setApiKey("");
      setMasked("已保存（新 Key 已加密存储）");
      setMessage("保存成功 ✿ 生成文章时将使用此配置");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-5 shadow-soft dark:border-white/10">
        <h2 className="font-cute mb-1 flex items-center gap-2 text-base font-semibold">
          <KeyRound className="h-4 w-4 text-pink-400" /> DeepSeek API 配置
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          配置保存在数据库中（API Key 加密存储），未填写的项沿用原配置；也可在 .env 中配置作为默认值。
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={masked ? `已配置：${masked}（留空表示不修改）` : "填写 DeepSeek API Key"}
              className={inputCls}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                <Cpu className="h-4 w-4 text-violet-400" /> 模型
              </label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
                <option value="deepseek-chat">deepseek-chat</option>
                <option value="deepseek-reasoner">deepseek-reasoner</option>
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                <Link2 className="h-4 w-4 text-sky-400" /> 接口地址
              </label>
              <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="cute-btn-pop flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03] disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "保存中..." : "保存配置"}
            </button>
            {message && <span className="text-sm text-muted-foreground">{message}</span>}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        提示：配置保存后，在「AI 文章」页点击「生成文章」即可使用。未配置 Key 时会提示错误，不影响博客其它功能。
      </p>
    </div>
  );
}
