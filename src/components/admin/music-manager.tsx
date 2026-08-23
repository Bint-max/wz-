"use client";

/**
 * 音乐管理（卡哇伊版）
 * 支持歌曲增删改、音频/封面/歌词上传、排序与默认歌单标记。
 */
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Music2,
  Upload,
  Save,
  X,
} from "lucide-react";
import type { MusicItem } from "@/types";

type FormState = {
  title: string;
  artist: string;
  cover: string;
  url: string;
  lyric: string;
  category: string;
  sort: number;
  status: "ACTIVE" | "DISABLED";
  isRecommend: boolean;
  isHomeBgm: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  artist: "",
  cover: "",
  url: "",
  lyric: "",
  category: "",
  sort: 0,
  status: "ACTIVE",
  isRecommend: false,
  isHomeBgm: false,
};

type UploadKind = "audio" | "cover" | "lyric";

export function MusicManager() {
  const [list, setList] = useState<MusicItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<MusicItem | null>(null);
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadKindRef = useRef<UploadKind>("audio");

  const load = () =>
    fetch("/api/admin/music")
      .then((r) => r.json())
      .then((d) => d.success && setList(d.data))
      .catch(() => setMessage("加载歌单失败"));

  useEffect(() => {
    load();
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
  };

  const startEdit = (m: MusicItem) => {
    setEditing(m);
    setForm({
      title: m.title,
      artist: m.artist,
      cover: m.cover ?? "",
      url: m.url,
      lyric: m.lyric ?? "",
      category: m.category ?? "",
      sort: m.sort,
      status: m.status,
      isRecommend: m.isRecommend,
      isHomeBgm: m.isHomeBgm,
    });
  };

  const submit = async () => {
    if (!form.title.trim() || !form.artist.trim() || !form.url.trim()) {
      setMessage("请填写歌曲名称、歌手和音乐文件地址");
      return;
    }
    setMessage("");
    const payload = {
      ...form,
      title: form.title.trim(),
      artist: form.artist.trim(),
      cover: form.cover.trim() || null,
      url: form.url.trim(),
      lyric: form.lyric.trim() || null,
      category: form.category.trim() || null,
      sort: Number(form.sort) || 0,
    };
    const res = editing
      ? await fetch(`/api/admin/music/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    const data = await res.json();
    if (res.ok) {
      setMessage(editing ? "已保存 ✿" : "已添加 ✿");
      resetForm();
      load();
    } else {
      setMessage(data.error ?? "保存失败");
    }
  };

  const remove = async (m: MusicItem) => {
    if (!confirm(`确定删除《${m.title}》吗？`)) return;
    await fetch(`/api/admin/music/${m.id}`, { method: "DELETE" });
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    const res = await fetch("/api/admin/music/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((m) => m.id) }),
    });
    const data = await res.json();
    if (res.ok) {
      load();
    } else {
      setMessage(data.error ?? "排序失败");
    }
  };

  const pickFile = (kind: UploadKind) => {
    uploadKindRef.current = kind;
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const kind = uploadKindRef.current;
    setUploading(kind);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/admin/music/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      if (kind === "audio") set("url", data.data.url);
      else if (kind === "cover") set("cover", data.data.url);
      else set("lyric", data.data.url);
      setMessage(`上传成功：${data.data.url}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const inputCls =
    "w-full rounded-2xl border-2 border-pink-100 bg-background/70 px-3 py-2 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20";

  return (
    <div className="space-y-5">
      <input ref={fileInputRef} type="file" hidden onChange={onFileChange} />

      {/* 新增 / 编辑 */}
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-cute text-base font-semibold">
            {editing ? `编辑歌曲：${editing.title}` : "新增歌曲"}
          </h2>
          {editing && (
            <button
              onClick={resetForm}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">歌曲名称</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="例如：晴天"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">歌手名称</label>
            <input
              value={form.artist}
              onChange={(e) => set("artist", e.target.value)}
              placeholder="例如：周杰伦"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">音乐文件地址</label>
            <div className="flex gap-2">
              <input
                value={form.url}
                onChange={(e) => set("url", e.target.value)}
                placeholder="/uploads/music/xxx.mp3 或外链"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => pickFile("audio")}
                disabled={uploading === "audio"}
                className="flex shrink-0 items-center gap-1 rounded-full border-2 border-pink-100 px-3 py-2 text-xs text-muted-foreground transition hover:bg-pink-50 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading === "audio" ? "上传中" : "上传"}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">封面地址</label>
            <div className="flex gap-2">
              <input
                value={form.cover}
                onChange={(e) => set("cover", e.target.value)}
                placeholder="/uploads/covers/xxx.jpg 或外链"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => pickFile("cover")}
                disabled={uploading === "cover"}
                className="flex shrink-0 items-center gap-1 rounded-full border-2 border-pink-100 px-3 py-2 text-xs text-muted-foreground transition hover:bg-pink-50 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading === "cover" ? "上传中" : "上传"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">歌词文件地址（LRC）</label>
            <div className="flex gap-2">
              <input
                value={form.lyric}
                onChange={(e) => set("lyric", e.target.value)}
                placeholder="/uploads/lyrics/xxx.lrc 或外链"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => pickFile("lyric")}
                disabled={uploading === "lyric"}
                className="flex shrink-0 items-center gap-1 rounded-full border-2 border-pink-100 px-3 py-2 text-xs text-muted-foreground transition hover:bg-pink-50 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading === "lyric" ? "上传中" : "上传"}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              场景标签（文章分类 slug，如 tech / life / home）
            </label>
            <input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="可选"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">排序值</label>
              <input
                type="number"
                value={form.sort}
                onChange={(e) => set("sort", Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">状态</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as FormState["status"])}
                className={inputCls}
              >
                <option value="ACTIVE">上架</option>
                <option value="DISABLED">下架</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isRecommend}
                onChange={(e) => set("isRecommend", e.target.checked)}
                className="h-4 w-4 accent-pink-500"
              />
              推荐歌曲
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isHomeBgm}
                onChange={(e) => set("isHomeBgm", e.target.checked)}
                className="h-4 w-4 accent-violet-500"
              />
              首页背景音乐
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            className="cute-btn-pop flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:scale-[1.03]"
          >
            <Save className="h-4 w-4" />
            {editing ? "保存修改" : "添加歌曲"}
          </button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      </div>

      {/* 歌曲列表 */}
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="rounded-[1.5rem] border-2 border-dashed border-pink-200 p-8 text-center text-sm text-muted-foreground">
            还没有歌曲，先添加一首吧 🎵
          </div>
        )}
        {list.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-3 shadow-soft dark:border-white/10"
          >
            {m.cover ? (
              <img
                src={m.cover}
                alt={m.title}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-violet-200">
                <Music2 className="h-5 w-5 text-white" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium">{m.title}</p>
                <span className="text-xs text-muted-foreground">{m.artist}</span>
                {m.isRecommend && (
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] text-pink-500 dark:bg-pink-500/20">
                    推荐
                  </span>
                )}
                {m.isHomeBgm && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-500 dark:bg-violet-500/20">
                    首页
                  </span>
                )}
                {m.status === "DISABLED" && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    已下架
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {m.category ? `${m.category} · ` : ""}
                播放 {m.playCount} 次 · 排序 {m.sort}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                aria-label="上移"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded-full p-2 text-muted-foreground hover:bg-pink-100 disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                aria-label="下移"
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1}
                className="rounded-full p-2 text-muted-foreground hover:bg-pink-100 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                aria-label="编辑"
                onClick={() => startEdit(m)}
                className="rounded-full p-2 text-muted-foreground hover:bg-pink-100 hover:text-pink-500"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                aria-label="删除"
                onClick={() => remove(m)}
                className="rounded-full p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
