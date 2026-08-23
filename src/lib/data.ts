/**
 * 服务端数据访问层
 * 集中封装 Prisma 查询，供页面与 API 复用
 */
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { PostListItem, CommentItem, CategoryItem, TagItem } from "@/types";

/**
 * 查询降级保护：数据库不可用时返回默认值，
 * 保证公开页面在本地无数据库构建 / 首次部署时仍可渲染。
 * 后台 API 不使用此保护，错误会正常抛出。
 */
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    console.error("[data] 查询失败（已降级）:", e);
    return fallback;
  }
}

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  published: true,
  featured: true,
  views: true,
  readingTime: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
  author: { select: { name: true, avatar: true } },
} satisfies Prisma.PostSelect;

/** 将文章查询结果映射为列表项类型 */
function mapPost(p: any) {
  return {
    ...p,
    tags: p.tags.map((t: any) => t.tag),
  } as unknown as PostListItem;
}

export type PostQuery = {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  tagSlug?: string;
  q?: string;
  featured?: boolean;
  includeDrafts?: boolean;
};

/** 获取已发布文章列表（支持分页、分类、标签、搜索） */
export async function getPosts(query: PostQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 10));
  const where: Prisma.PostWhereInput = {
    published: query.includeDrafts ? undefined : true,
    ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
    ...(query.tagSlug ? { tags: { some: { tag: { slug: query.tagSlug } } } } : {}),
    ...(query.featured ? { featured: true } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { excerpt: { contains: query.q, mode: "insensitive" } },
            { content: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const result = await safe(
    Promise.all([
      prisma.post.findMany({
        where,
        select: postSelect,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]),
    [[], 0] as [any[], number],
  );

  const [posts, total] = result as [any[], number];

  return {
    posts: posts.map(mapPost),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** 获取热门文章（按阅读量） */
export async function getHotPosts(limit = 5) {
  const posts = await safe(
    prisma.post.findMany({
      where: { published: true },
      select: postSelect,
      orderBy: { views: "desc" },
      take: limit,
    }),
    [] as any[],
  );
  return posts.map(mapPost);
}

/** 获取最新文章 */
export async function getLatestPosts(limit = 6) {
  const posts = await safe(
    prisma.post.findMany({
      where: { published: true },
      select: postSelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    }),
    [] as any[],
  );
  return posts.map(mapPost);
}

/** 获取全部文章 slug（用于站点地图） */
export async function getAllPostSlugs() {
  return safe(
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    [] as { slug: string; updatedAt: Date }[],
  );
}

/** 获取文章详情并递增阅读量 */
export async function getPostBySlug(slug: string) {
  const post = await safe(
    prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: { select: { name: true, avatar: true, bio: true } },
        comments: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            authorName: true,
            authorEmail: true,
            content: true,
            status: true,
            createdAt: true,
            parentId: true,
          },
        },
      },
    }),
    null,
  );

  if (!post || (!post.published && !process.env.DISABLE_DRAFT_GUARD)) return null;

  // 递增阅读量（失败不影响页面渲染）
  await prisma.post
    .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  return {
    ...post,
    tags: post.tags.map((t) => t.tag),
    comments: post.comments as CommentItem[],
  };
}

/** 获取文章元信息（用于 SEO，不增加阅读量） */
export async function getPostMeta(slug: string) {
  return safe(
    prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
    null,
  );
}

/** 获取分类及其文章数 */
export const getCategories = cache(async (): Promise<CategoryItem[]> => {
  return safe(
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: { select: { posts: { where: { published: true } } } },
      },
    }),
    [] as CategoryItem[],
  );
});

/** 获取标签及其文章数 */
export const getTags = cache(async (): Promise<TagItem[]> => {
  return safe(
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { posts: { where: { post: { is: { published: true } } } } } },
      },
    }),
    [] as TagItem[],
  );
});

/** 获取站点统计信息 */
export async function getSiteStats() {
  const data = await safe(
    Promise.all([
      prisma.post.count({ where: { published: true } }),
      prisma.post.aggregate({ _sum: { views: true }, where: { published: true } }),
      prisma.comment.count({ where: { status: "APPROVED" } }),
      prisma.visitStat.findMany({ orderBy: { date: "desc" }, take: 14 }),
      prisma.visitStat.aggregate({ _sum: { count: true } }),
    ]),
    [0, { _sum: { views: 0 } }, 0, [] as { date: Date; count: number }[], { _sum: { count: 0 } }] as [
      number,
      { _sum: { views: number | null } },
      number,
      { date: Date; count: number }[],
      { _sum: { count: number | null } },
    ],
  );

  const [postCount, viewSum, commentCount, latestVisits, totalVisits] = data;

  return {
    postCount,
    totalViews: viewSum._sum.views ?? 0,
    commentCount,
    totalVisits: totalVisits._sum.count ?? 0,
    dailyVisits: [...latestVisits].reverse(),
  };
}

/** 记录一次全站访问（按天聚合） */
export async function recordVisit() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.visitStat
    .upsert({
      where: { date: today },
      update: { count: { increment: 1 } },
      create: { date: today, count: 1 },
    })
    .catch(() => {});
}
