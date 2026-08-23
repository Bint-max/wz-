/**
 * Tags 模块 Repository：只封装 Prisma 数据访问
 */
import { prisma } from "@/lib/prisma";

export const tagRepository = {
  findManyWithCount() {
    return prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { posts: { where: { post: { is: { published: true } } } } } },
      },
    });
  },

  findById(id: string) {
    return prisma.tag.findUnique({ where: { id } });
  },

  create(data: { name: string; slug: string }) {
    return prisma.tag.create({ data });
  },

  update(id: string, data: { name?: string; slug?: string }) {
    return prisma.tag.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.tag.delete({ where: { id } });
  },
};
