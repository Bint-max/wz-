import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { musicController } from "@/server/music/controller";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/music/:id/play —— 记录播放次数（公开接口）
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const music = await musicController.play(id);
    return ok(music);
  } catch (e) {
    // 记录失败不阻断播放，保持幂等
    return fail(e instanceof Error ? e.message : "记录播放次数失败", 500);
  }
}
