/**
 * 音乐播放器客户端工具
 * 包含类型、LRC 歌词解析、播放状态持久化与场景切换事件。
 */
import type { MusicItem } from "@/types";

export type PlayMode = "order" | "single" | "shuffle";

export type LyricLine = { time: number; text: string };

/** 播放器持久化状态（localStorage） */
export type MusicPlayerPersist = {
  playlist: MusicItem[];
  index: number;
  mode: PlayMode;
  volume: number;
};

export const MUSIC_STORAGE_KEY = "blog_music_player_v1";
export const MUSIC_VOLUME_KEY = "blog_music_volume_v1";
export const MUSIC_SCENE_EVENT = "music:set-scene";

/** 秒数格式化为 mm:ss */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 解析 LRC 歌词文本为按时间排序的行 */
export function parseLrc(lrc: string): LyricLine[] {
  const tagRegex = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
  const lines: LyricLine[] = [];

  for (const raw of lrc.split(/\r?\n/)) {
    const tags = Array.from(raw.matchAll(tagRegex));
    if (tags.length === 0) continue;
    const text = raw.replace(tagRegex, "").trim();
    for (const tag of tags) {
      const minutes = Number(tag[1]);
      const seconds = Number(tag[2]);
      const millis = tag[3] ? Number(tag[3].padEnd(3, "0")) : 0;
      if (Number.isNaN(minutes) || Number.isNaN(seconds)) continue;
      lines.push({ time: minutes * 60 + seconds + millis / 1000, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

/** 读取持久化状态（损坏数据自动忽略） */
export function loadMusicPersist(): MusicPlayerPersist | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MUSIC_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (
      !Array.isArray(data?.playlist) ||
      typeof data?.index !== "number" ||
      !["order", "single", "shuffle"].includes(data?.mode)
    ) {
      return null;
    }
    return data as MusicPlayerPersist;
  } catch {
    return null;
  }
}

/** 保存持久化状态 */
export function saveMusicPersist(state: MusicPlayerPersist) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 存储不可用时静默失败，不影响播放
  }
}

export function loadVolume(): number | null {
  if (typeof window === "undefined") return null;
  const v = Number(window.localStorage.getItem(MUSIC_VOLUME_KEY));
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : null;
}

export function saveVolume(volume: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUSIC_VOLUME_KEY, String(volume));
  } catch {
    // ignore
  }
}

/**
 * 请求播放器切换到指定场景（文章分类 slug，或 "home"）。
 * 播放器监听到该事件后会重新拉取对应分类的歌单。
 */
export function setMusicScene(category: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string | null>(MUSIC_SCENE_EVENT, { detail: category }));
}
