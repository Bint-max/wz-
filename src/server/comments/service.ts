/**
 * Comments 模块 Service
 */
import { notFound } from "@/lib/errors";
import type { CommentStatus } from "@prisma/client";
import { commentRepository as repo } from "./repository";

/** 简易反垃圾规则 */
export function isSpam(content: string): boolean {
  const links = content.match(/https?:\/\//g)?.length ?? 0;
  const spamWords = ["赌博", "彩票", "代开发票", "办证", "sex", "casino"];
  if (links > 3) return true;
  return spamWords.some((w) => content.toLowerCase().includes(w.toLowerCase()));
}

export const commentService = {
  async adminList(status?: CommentStatus, postId?: string) {
    return repo.findManyAdmin(status, postId);
  },

  async listPublic(postId: string) {
    const post = await repo.findApprovedByPost(postId);
    return post;
  },

  async updateStatus(id: string, status: CommentStatus) {
    const existing = await repo.findManyAdmin();
    if (!existing.some((c) => c.id === id)) throw notFound("评论不存在");
    return repo.updateStatus(id, status);
  },

  async remove(id: string) {
    return repo.delete(id);
  },

  async create(input: {
    postId: string;
    authorName: string;
    authorEmail?: string | null;
    content: string;
    ip?: string | null;
  }) {
    return repo.create({
      postId: input.postId,
      authorName: input.authorName,
      authorEmail: input.authorEmail ?? null,
      content: input.content,
      ip: input.ip ?? null,
      status: isSpam(input.content) ? "SPAM" : "PENDING",
    });
  },
};
