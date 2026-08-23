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
