/**
 * API 入参校验（zod）
 */
import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1, "正文不能为空"),
  coverImage: z.string().url().optional().nullable().or(z.literal("")),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  categoryId: z.string().cuid().optional().nullable(),
  tagIds: z.array(z.string()).optional().default([]),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const commentSchema = z.object({
  authorName: z.string().min(1, "昵称不能为空").max(50),
  authorEmail: z.string().email().optional().or(z.literal("")),
  content: z.string().min(1, "评论内容不能为空").max(2000),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).optional(),
  description: z.string().max(300).optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(50),
});

export const settingsSchema = z.record(z.string());

// ---------- AI 内容生产模块 ----------

const sourceUrlSchema = z
  .string()
  .trim()
  .refine((v) => {
    if (!v) return false;
    const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      const u = new URL(candidate);
      return u.hostname.length > 0;
    } catch {
      return false;
    }
  }, "请输入合法 URL（可省略 http:// 或 https://）");

export const newsSourceSchema = z.object({
  name: z.string().min(1, "来源名称不能为空").max(50),
  type: z.enum(["RSS", "API"]).default("RSS"),
  url: sourceUrlSchema,
  enabled: z.boolean().optional().default(true),
  newsType: z.string().max(30).optional().nullable(),
  defaultCategoryId: z.string().optional().nullable(),
  defaultTags: z.array(z.string()).optional().default([]),
  config: z.record(z.unknown()).optional().nullable(),
});

export const aiArticleOutputSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).default(""),
  content: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  category: z.string().optional().default(""),
});

export const aiArticleUpdateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200).optional(),
  summary: z.string().max(500).optional().nullable(),
  content: z.string().min(1, "正文不能为空").optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  suggestedCategoryId: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const aiGenerateSchema = z.object({
  newsId: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional(),
  type: z.string().max(30).optional(),
});

export const publishArticleSchema = z.object({
  id: z.string().min(1, "缺少文章 ID"),
});

// ---------- 音乐播放器模块 ----------

export const musicSchema = z.object({
  title: z.string().min(1, "歌曲名称不能为空").max(200),
  artist: z.string().min(1, "歌手名称不能为空").max(100),
  cover: z.string().optional().nullable().or(z.literal("")),
  url: z.string().min(1, "音乐文件地址不能为空"),
  lyric: z.string().optional().nullable().or(z.literal("")),
  category: z.string().max(50).optional().nullable().or(z.literal("")),
  isRecommend: z.boolean().optional().default(false),
  isHomeBgm: z.boolean().optional().default(false),
  sort: z.number().int().optional().default(0),
  status: z.enum(["ACTIVE", "DISABLED"]).optional().default("ACTIVE"),
});
