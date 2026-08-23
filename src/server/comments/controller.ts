/**
 * Comments 模块 Controller
 */
import { requireAdmin } from "@/lib/auth";
import { commentService } from "./service";
import type { CommentStatus } from "@prisma/client";

export const commentController = {
  async adminList(status?: CommentStatus, postId?: string) {
    await requireAdmin();
    return commentService.adminList(status, postId);
  },

  async updateStatus(id: string, status: CommentStatus) {
    await requireAdmin();
    return commentService.updateStatus(id, status);
  },

  async remove(id: string) {
    await requireAdmin();
    return commentService.remove(id);
  },

  listPublic(postId: string) {
    return commentService.listPublic(postId);
  },

  create(input: Parameters<typeof commentService.create>[0]) {
    return commentService.create(input);
  },
};
