/**
 * 全局共享类型定义
 */

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
  author: { name: string; avatar: string | null };
};

export type CommentItem = {
  id: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: string;
  createdAt: Date;
  parentId: string | null;
};

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { posts: number };
};

export type TagItem = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
};
