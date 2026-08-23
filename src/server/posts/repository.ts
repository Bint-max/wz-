/**
 * Posts 模块 Repository
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const postSelect = {
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
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
  author: { select: { name: true, avatar: true } },
} satisfies Prisma.PostSelect;

export function mapPost(p: any) {
  return { ...p, tags: p.tags.map((t: any) => t.tag) };
}

export const postRepository = {
  findMany(where: Prisma.PostWhereInput, skip: number, take: number) {
    return prisma.post.findMany({
      where,
      select: postSelect,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    });
  },

  count(where: Prisma.PostWhereInput) {
    return prisma.post.count({ where });
  },

  findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: { category: true, tags: { include: { tag: true } } },
    });
  },

  async findUniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let i = 2;
    while (true) {
      const existing = await prisma.post.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
        select: { id: true },
      });
      if (!existing) return slug;
      slug = `${base}-${i++}`;
    }
  },

  create(data: Prisma.PostUncheckedCreateInput) {
    return prisma.post.create({
      data,
      include: { category: true, tags: { include: { tag: true } } },
    });
  },

  update(id: string, data: Prisma.PostUncheckedUpdateInput) {
    return prisma.post.update({
      where: { id },
      data,
      include: { category: true, tags: { include: { tag: true } } },
    });
  },

  delete(id: string) {
    return prisma.post.delete({ where: { id } });
  },
};
