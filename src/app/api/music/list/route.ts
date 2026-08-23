import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api";

/**
 * GET /api/music/list —— 获取前台可用音乐列表
 * 可选查询参数：
 *  - category=tech —— 按场景/文章分类筛选
 *  - recommend=1  —— 仅推荐歌曲
 *  - home=1       —— 仅首页背景音乐
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();
    const recommend = searchParams.get("recommend") === "1";
    const home = searchParams.get("home") === "1";

    const where = {
      status: "ACTIVE" as const,
      ...(category ? { category } : {}),
      ...(recommend ? { isRecommend: true } : {}),
      ...(home ? { isHomeBgm: true } : {}),
    };

    const music = await prisma.music.findMany({
      where,
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    });

    return ok(music);
  } catch (e) {
    return handleError(e);
  }
}
