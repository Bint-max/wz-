import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { musicSchema } from "@/lib/validation";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/music/:id —— 编辑歌曲
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = musicSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const music = await prisma.music.update({
      where: { id },
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
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.music.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
