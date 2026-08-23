import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

/**
 * GET /api/comments?status=&postId= —— 后台评论列表（需登录）
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const postId = searchParams.get("postId") || undefined;

    const comments = await prisma.comment.findMany({
      where: {
        ...(status ? { status: status as "PENDING" | "APPROVED" | "SPAM" | "REJECTED" } : {}),
        ...(postId ? { postId } : {}),
      },
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return ok(comments);
  } catch (e) {
    return handleError(e);
  }
}
