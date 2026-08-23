/**
 * Categories 模块 Repository：只封装 Prisma 数据访问，不写业务规则
 */
import { prisma } from "@/lib/prisma";

export const categoryRepository = {
  findManyWithCount() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        _count: { select: { posts: { where: { published: true } } } },
      },
    });
  },

  findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  create(data: { name: string; slug: string; description: string | null; sortOrder: number }) {
    return prisma.category.create({ data });
  },

  update(id: string, data: { name?: string; slug?: string; description?: string | null; sortOrder?: number }) {
    return prisma.category.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
