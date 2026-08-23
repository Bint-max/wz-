import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/music/:id/play —— 记录播放次数（公开接口）
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const music = await prisma.music.update({
      where: { id },
      data: { playCount: { increment: 1 } },
      select: { id: true, playCount: true },
    });
    return ok(music);
  } catch (e) {
    // 记录失败不应影响播放，统一返回错误但保持幂等
    return fail(e instanceof Error ? e.message : "记录播放次数失败", 500);
  }
}
