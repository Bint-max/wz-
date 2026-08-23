import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { musicController } from "@/server/music/controller";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/music/:id —— 获取单首音乐
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const music = await musicController.getPublic(id);
    return ok(music);
  } catch (e) {
    return handleError(e);
  }
}
