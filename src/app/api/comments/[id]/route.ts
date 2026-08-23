import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { commentController } from "@/server/comments/controller";
import { commentStatusSchema } from "@/server/comments/schema";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/comments/:id —— 更新评论状态（审核）
 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = commentStatusSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const comment = await commentController.updateStatus(id, parsed.data.status);
    return ok(comment);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/comments/:id —— 删除评论
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await commentController.remove(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
