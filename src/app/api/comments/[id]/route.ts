import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/comments/:id —— 更新评论状态（审核）
 * body: { status: "APPROVED" | "SPAM" | "REJECTED" | "PENDING" }
 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json();
    const status = body?.status;
    const allowed = ["PENDING", "APPROVED", "SPAM", "REJECTED"];
    if (!allowed.includes(status)) return fail("无效的状态");

    const comment = await prisma.comment.update({
      where: { id },
      data: { status },
    });
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
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.comment.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
