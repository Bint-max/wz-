import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/music/:id —— 获取音乐详情（仅前台可用状态）
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const music = await prisma.music.findFirst({
      where: { id, status: "ACTIVE" },
    });
    if (!music) return fail("音乐不存在或已下架", 404);
    return ok(music);
  } catch (e) {
    return handleError(e);
  }
}
