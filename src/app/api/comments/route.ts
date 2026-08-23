import { NextRequest } from "next/server";
import { CommentStatus } from "@prisma/client";
import { ok, fail, handleError } from "@/lib/api";
import { commentController } from "@/server/comments/controller";

/**
 * GET /api/comments?status=&postId= —— 后台评论列表（需登录）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    let status: CommentStatus | undefined;
    if (statusParam) {
      const values = Object.values(CommentStatus) as string[];
      if (!values.includes(statusParam)) return fail(`无效的状态，可选值：${values.join("/")}`);
      status = statusParam as CommentStatus;
    }
    const postId = searchParams.get("postId") || undefined;

    const comments = await commentController.adminList(status, postId);
    return ok(comments);
  } catch (e) {
    return handleError(e);
  }
}
