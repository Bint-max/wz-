"use client";

/**
 * 文件管理（卡哇伊版）
 */
import { useState } from "react";
import { Trash2, HardDrive } from "lucide-react";
import { useMedia } from "@/client/hooks/useMedia";

const kindLabels: Record<string, string> = {
  IMAGE: "图片",
  AUDIO: "音乐",
  LYRIC: "歌词",
  COVER: "封面",
};

function formatSize(size: number | null): string {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaManager() {
  const { media, loading, error, deleteMedia } = useMedia();
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!confirm("确定删除该文件记录吗？")) return;
    setBusyId(id);
    try {
      await deleteMedia(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
        <h2 className="font-cute flex items-center gap-2 text-base font-semibold">
          <HardDrive className="h-4 w-4 text-sky-400" /> 文件管理
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          查看后台上传的文件记录；当前版本仅管理元信息，物理文件删除将在对象存储接入后完善。
        </p>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">加载中...</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{error}</p>
      ) : media.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">暂无文件记录。</p>
      ) : (
        <div className="overflow-x-auto rounded-[1.5rem] border-2 border-white/70 bg-card/90 shadow-soft dark:border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-pink-100 text-xs text-muted-foreground dark:border-white/10">
                <th className="px-4 py-3">类型</th>
                <th className="px-4 py-3">文件</th>
                <th className="px-4 py-3">大小</th>
                <th className="px-4 py-3">上传者</th>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {media.map((m) => (
                <tr key={m.id} className="border-b border-pink-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-500">
                      {kindLabels[m.kind] ?? m.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="line-clamp-1 text-xs text-primary underline">
                      {m.originalName ?? m.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs">{formatSize(m.size)}</td>
                  <td className="px-4 py-3 text-xs">{m.uploader?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-xs">{new Date(m.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove(m.id)}
                      disabled={busyId === m.id}
                      className="rounded-full border-2 border-red-100 p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
