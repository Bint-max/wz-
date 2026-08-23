import { NextRequest } from "next/server";
import { ok, fail, handleError, getIp } from "@/lib/api";
import { commentController } from "@/server/comments/controller";
import { commentCreateSchema } from "@/server/comments/schema";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/posts/:id/comments —— 获取已审核评论
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const comments = await commentController.listPublic(id);
    return ok(comments);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/posts/:id/comments —— 提交评论（进入待审核）
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = commentCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const comment = await commentController.create({
      postId: id,
      authorName: data.authorName,
      authorEmail: data.authorEmail || null,
      content: data.content,
      ip: getIp(req),
    });

    return ok(comment, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
