import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { musicController } from "@/server/music/controller";
import { musicReorderSchema } from "@/server/music/schema";

/**
 * PUT /api/admin/music/reorder —— 调整歌曲排序
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = musicReorderSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const result = await musicController.reorder(parsed.data.ids);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
