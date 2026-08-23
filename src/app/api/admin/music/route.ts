import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { musicController } from "@/server/music/controller";
import { musicCreateSchema } from "@/server/music/schema";

/**
 * GET /api/admin/music —— 后台获取全部音乐（含已下架）
 */
export async function GET() {
  try {
    const music = await musicController.adminList();
    return ok(music);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/admin/music —— 新增歌曲
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = musicCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const music = await musicController.create(parsed.data);
    return ok(music, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
