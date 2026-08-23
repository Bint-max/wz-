/**
 * Users 模块 Repository：用户数据访问
 */
import { prisma } from "@/lib/prisma";

const listSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatar: true,
  bio: true,
  role: true,
  status: true,
  createdAt: true,
  lastLoginAt: true,
  _count: { select: { posts: true } },
} as const;

export const userRepository = {
  findMany() {
    return prisma.user.findMany({
      select: listSelect,
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  update(
    id: string,
    data: {
      username?: string | null;
      name?: string;
      bio?: string | null;
      role?: "ADMIN" | "EDITOR" | "USER";
      status?: "ACTIVE" | "DISABLED";
    },
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: listSelect,
    });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
