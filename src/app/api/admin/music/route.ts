import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { musicSchema } from "@/lib/validation";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/admin/music —— 后台获取全部音乐（含已下架）
 */
export async function GET() {
  try {
    await requireAdmin();
    const music = await prisma.music.findMany({
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    });
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
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const parsed = musicSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const music = await prisma.music.create({
      data: {
        title: data.title,
        artist: data.artist,
        cover: data.cover || null,
        url: data.url,
        lyric: data.lyric || null,
        category: data.category || null,
        isRecommend: data.isRecommend,
        isHomeBgm: data.isHomeBgm,
        sort: data.sort,
        status: data.status,
      },
    });

    return ok(music, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
