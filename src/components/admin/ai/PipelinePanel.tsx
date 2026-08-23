"use client";

/**
 * AI 流水线手动触发面板
 * 采集新闻 / 批量生成文章
 */
import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

export function PipelinePanel({ onDone }: { onDone?: () => void }) {
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState<"collect" | "generate" | null>(null);
  const [message, setMessage] = useState("");

  const collect = async () => {
    setLoading("collect");
    setMessage("");
    try {
      const res = await fetch("/api/admin/ai/collect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "采集失败");
      setMessage(`采集完成：新增 ${data.data.created} 条，更新 ${data.data.updated} 条，失败 ${data.data.failed} 条 ✿`);
      onDone?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "采集失败");
    } finally {
      setLoading(null);
    }
  };

  const generate = async () => {
    setLoading("generate");
    setMessage("");
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      setMessage(`生成完成：成功 ${data.data.success} 篇，失败 ${data.data.failed} 篇 ✨`);
      onDone?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-5 shadow-soft dark:border-white/10">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={collect}
          disabled={loading !== null}
          className="flex items-center gap-1.5 rounded-full border-2 border-pink-100 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-pink-50 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" /> {loading === "collect" ? "采集中..." : "立即采集新闻"}
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={20}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-20 rounded-full border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20"
          />
          <button
            onClick={generate}
            disabled={loading !== null}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03] disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" /> {loading === "generate" ? "生成中..." : "生成文章"}
          </button>
        </div>

        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        生成前请先在「新闻来源」中配置 RSS/API 来源，并在 .env 中配置 DEEPSEEK_API_KEY。
      </p>
    </div>
  );
}
