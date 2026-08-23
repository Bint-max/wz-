import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { musicController } from "@/server/music/controller";
import { musicCreateSchema } from "@/server/music/schema";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/music/:id —— 编辑歌曲
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = musicCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const music = await musicController.update(id, parsed.data);
    return ok(music);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/admin/music/:id —— 删除歌曲
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await musicController.remove(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
