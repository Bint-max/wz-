/**
 * Posts 模块 Service
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify, estimateReadingTime } from "@/lib/utils";
import { notFound } from "@/lib/errors";
import { postRepository as repo, mapPost } from "./repository";
import type { PostCreateInput } from "./schema";

function buildListWhere(query: {
  admin?: boolean;
  categorySlug?: string;
  tagSlug?: string;
  q?: string;
}) {
  return {
    ...(query.admin ? {} : { published: true }),
    ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
    ...(query.tagSlug ? { tags: { some: { tag: { slug: query.tagSlug } } } } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" as const } },
            { excerpt: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  } satisfies Prisma.PostWhereInput;
}

export const postService = {
  async list(query: { page?: number; pageSize?: number; admin?: boolean; categorySlug?: string; tagSlug?: string; q?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 10));
    const where = buildListWhere(query);

    const [rows, total] = await Promise.all([
      repo.findMany(where, (page - 1) * pageSize, pageSize),
      repo.count(where),
    ]);

    return {
      posts: rows.map(mapPost),
      total,
      page,
      pageSize,
    };
  },

  async getById(id: string) {
    const post = await repo.findById(id);
    if (!post) throw notFound("文章不存在");
    return { ...post, tags: post.tags.map((t) => t.tag) };
  },

  async create(input: PostCreateInput, authorId: string) {
    const base = slugify(input.slug ?? input.title) || "post";
    const slug = await repo.findUniqueSlug(base);
    return repo.create({
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content: input.content,
      coverImage: input.coverImage || null,
      published: input.published ?? false,
      featured: input.featured ?? false,
      readingTime: estimateReadingTime(input.content),
      publishedAt:
        input.published && input.publishedAt
          ? new Date(input.publishedAt)
          : input.published
            ? new Date()
            : null,
      categoryId: input.categoryId || null,
      authorId,
      tags: { create: (input.tagIds ?? []).map((tagId) => ({ tagId })) },
    });
  },

  async update(id: string, input: PostCreateInput) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("文章不存在");

    const base = input.slug
      ? slugify(input.slug)
      : input.title !== existing.title
        ? slugify(input.title)
        : existing.slug;
    const slug = base && base !== existing.slug ? await repo.findUniqueSlug(base, id) : existing.slug;

    const updateData: Prisma.PostUncheckedUpdateInput = {
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content: input.content,
      coverImage: input.coverImage || null,
      published: input.published ?? false,
      featured: input.featured ?? false,
      readingTime: estimateReadingTime(input.content),
      publishedAt:
        input.published && input.publishedAt
          ? new Date(input.publishedAt)
          : input.published && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      categoryId: input.categoryId || null,
      tags: { create: (input.tagIds ?? []).map((tagId) => ({ tagId })) },
    };

    const post = await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({ where: { postId: id } });
      return tx.post.update({
        where: { id },
        data: updateData,
        include: { category: true, tags: { include: { tag: true } } },
      });
    });

    return { ...post, tags: post.tags.map((t) => t.tag) };
  },

  async remove(id: string) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("文章不存在");
    return repo.delete(id);
  },
};
