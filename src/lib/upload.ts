/**
 * 文件上传工具
 * 本地开发将文件写入 public/uploads 子目录；生产环境建议替换为对象存储。
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type UploadKind = "audio" | "lyric" | "cover";

const CONFIG: Record<UploadKind, { dir: string; exts: string[]; maxSize: number; label: string }> = {
  audio: {
    dir: "music",
    exts: ["mp3", "m4a", "aac", "wav", "flac", "ogg"],
    maxSize: 50 * 1024 * 1024,
    label: "音乐文件",
  },
  lyric: {
    dir: "lyrics",
    exts: ["lrc", "txt"],
    maxSize: 2 * 1024 * 1024,
    label: "歌词文件",
  },
  cover: {
    dir: "covers",
    exts: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    maxSize: 5 * 1024 * 1024,
    label: "封面图片",
  },
};

/** 从文件名提取小写扩展名 */
function extOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/**
 * 保存上传文件到 public/uploads 并返回可访问 URL。
 * @param file 浏览器 File 对象
 * @param kind 上传类型
 */
export async function saveUpload(file: File, kind: UploadKind): Promise<{ url: string }> {
  const config = CONFIG[kind];
  const ext = extOf(file.name);

  if (!ext || !config.exts.includes(ext)) {
    throw new Error(`${config.label}仅支持 ${config.exts.join("/")} 格式`);
  }
  if (file.size > config.maxSize) {
    throw new Error(
      `${config.label}大小不能超过 ${Math.round(config.maxSize / 1024 / 1024)}MB`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", config.dir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return { url: `/uploads/${config.dir}/${filename}` };
}
