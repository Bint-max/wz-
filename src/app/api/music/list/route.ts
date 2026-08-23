import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { musicController } from "@/server/music/controller";

/**
 * GET /api/music/list —— 获取前台可用音乐列表
 * 可选：category / recommend=1 / home=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const music = await musicController.listPublic({
      category: searchParams.get("category")?.trim() || undefined,
      recommend: searchParams.get("recommend") === "1",
      home: searchParams.get("home") === "1",
    });
    return ok(music);
  } catch (e) {
    return handleError(e);
  }
}
