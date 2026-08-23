/**
 * Comments 模块 Repository
 */
import { prisma } from "@/lib/prisma";
import type { CommentStatus } from "@prisma/client";

export const commentRepository = {
  findManyAdmin(status?: CommentStatus, postId?: string) {
    return prisma.comment.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(postId ? { postId } : {}),
      },
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  },

  findApprovedByPost(postId: string) {
    return prisma.comment.findMany({
      where: { postId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(id: string, status: CommentStatus) {
    return prisma.comment.update({ where: { id }, data: { status } });
  },

  delete(id: string) {
    return prisma.comment.delete({ where: { id } });
  },

  create(data: {
    postId: string;
    authorName: string;
    authorEmail: string | null;
    content: string;
    status: CommentStatus;
    ip?: string | null;
  }) {
    return prisma.comment.create({ data });
  },
};
