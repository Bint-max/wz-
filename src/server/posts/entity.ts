/**
 * Posts 模块领域类型
 */
import type { PostListItem } from "@/types";

export type { PostListItem };

export type PostDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
};
