"use client";

/**
 * AI 设置页
 * 三个独立卡片，各自独立保存按钮，互不影响：
 * 1. DeepSeek 配置（API Key / 模型 / 接口地址）
 * 2. RSSHub 配置（热门渠道数据源地址）
 * 3. 微博 Cookie（微博热搜自动获取）
 */
import { useEffect, useState } from "react";
import { Save, KeyRound, Cpu, Link2, Rss, Cookie } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

const saveBtnCls =
  "cute-btn-pop flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03] disabled:opacity-50";

export function AiSettings() {
  // DeepSeek
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com");
  const [masked, setMasked] = useState("");
  const [dsSaving, setDsSaving] = useState(false);
  const [dsMsg, setDsMsg] = useState("");

  // RSSHub
  const [rsshubBaseUrl, setRsshubBaseUrl] = useState("https://rsshub.app");
  const [rhSaving, setRhSaving] = useState(false);
  const [rhMsg, setRhMsg] = useState("");

  // 微博 Cookie
  const [weiboCookie, setWeiboCookie] = useState("");
  const [weiboMasked, setWeiboMasked] = useState("");
  const [wbSaving, setWbSaving] = useState(false);
  const [wbMsg, setWbMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setModel(d.data.model);
          setBaseUrl(d.data.baseUrl);
          setRsshubBaseUrl(d.data.rsshubBaseUrl);
          setMasked(d.data.apiKeyMasked);
          setWeiboMasked(d.data.weiboCookieMasked);
        }
      })
      .catch(() => {});
  }, []);

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/ai/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "保存失败");
    return data;
  };

  const saveDeepSeek = async () => {
    setDsSaving(true);
    setDsMsg("");
    try {
      await post({ apiKey: apiKey || undefined, model, baseUrl });
      setApiKey("");
      setMasked("已保存（新 Key 已加密存储）");
      setDsMsg("DeepSeek 配置已保存 ✿");
    } catch (e) {
      setDsMsg(e instanceof Error ? e.message : "保存失败");
    } finally {
      setDsSaving(false);
    }
  };

  const saveRsshub = async () => {
    setRhSaving(true);
    setRhMsg("");
    try {
      await post({ rsshubBaseUrl });
      setRhMsg("RSSHub 地址已保存 ✿");
    } catch (e) {
      setRhMsg(e instanceof Error ? e.message : "保存失败");
    } finally {
      setRhSaving(false);
    }
  };

  const saveWeibo = async () => {
    setWbSaving(true);
    setWbMsg("");
    try {
      await post({ weiboCookie: weiboCookie || undefined });
      setWeiboCookie("");
      setWeiboMasked("已保存（Cookie 已加密存储）");
      setWbMsg("微博 Cookie 已保存 ✿");
    } catch (e) {
      setWbMsg(e instanceof Error ? e.message : "保存失败");
    } finally {
      setWbSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* 1. DeepSeek 配置 */}
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-5 shadow-soft dark:border-white/10">
        <h2 className="font-cute mb-1 flex items-center gap-2 text-base font-semibold">
          <KeyRound className="h-4 w-4 text-pink-400" /> DeepSeek 配置
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          API Key 加密存储；未填写的项沿用原配置；也可用 .env 作为默认值。
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
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveDeepSeek} disabled={dsSaving} className={saveBtnCls}>
            <Save className="h-4 w-4" /> {dsSaving ? "保存中..." : "保存 DeepSeek"}
          </button>
          {dsMsg && <span className="text-sm text-muted-foreground">{dsMsg}</span>}
        </div>
      </div>

      {/* 2. RSSHub 配置 */}
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-5 shadow-soft dark:border-white/10">
        <h2 className="font-cute mb-1 flex items-center gap-2 text-base font-semibold">
          <Rss className="h-4 w-4 text-orange-400" /> RSSHub 配置
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          用于「一键添加热门渠道」（知乎 / 央视等）。默认公共实例，建议自建后填写。
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium">RSSHub 地址</label>
          <input
            value={rsshubBaseUrl}
            onChange={(e) => setRsshubBaseUrl(e.target.value)}
            placeholder="http://127.0.0.1:1200"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            自建命令：docker run -d --name rsshub -p 1200:1200 diygod/rsshub
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveRsshub} disabled={rhSaving} className={saveBtnCls}>
            <Save className="h-4 w-4" /> {rhSaving ? "保存中..." : "保存 RSSHub"}
          </button>
          {rhMsg && <span className="text-sm text-muted-foreground">{rhMsg}</span>}
        </div>
      </div>

      {/* 3. 微博 Cookie */}
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-5 shadow-soft dark:border-white/10">
        <h2 className="font-cute mb-1 flex items-center gap-2 text-base font-semibold">
          <Cookie className="h-4 w-4 text-amber-400" /> 微博 Cookie（热搜自动获取）
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          采集「微博热搜」时自动使用该 Cookie 直连微博接口，无需 RSSHub。Cookie 加密存储，留空保存表示不修改。
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium">微博 Cookie</label>
          <input
            type="password"
            value={weiboCookie}
            onChange={(e) => setWeiboCookie(e.target.value)}
            placeholder={weiboMasked ? `已配置：${weiboMasked}（留空表示不修改）` : "粘贴微博登录后的 Cookie"}
            className={inputCls}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            获取方法：浏览器登录 weibo.com → F12 → Network → 任意请求的请求头里复制 Cookie 字段。
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveWeibo} disabled={wbSaving} className={saveBtnCls}>
            <Save className="h-4 w-4" /> {wbSaving ? "保存中..." : "保存微博 Cookie"}
          </button>
          {wbMsg && <span className="text-sm text-muted-foreground">{wbMsg}</span>}
        </div>
      </div>
    </div>
  );
}
