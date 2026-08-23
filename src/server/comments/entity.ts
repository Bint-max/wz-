/**
 * Comments 模块领域类型
 */
import type { CommentStatus } from "@prisma/client";

export type CommentItem = {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: CommentStatus;
  ip: string | null;
  createdAt: Date;
};
