import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "至少需要一首歌曲"),
});

/**
 * PUT /api/admin/music/reorder —— 调整歌曲排序
 * body: { ids: ["id1", "id2", ...] }，按数组顺序设置 sort 值
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    await prisma.$transaction(
      parsed.data.ids.map((id, index) =>
        prisma.music.update({ where: { id }, data: { sort: index + 1 } }),
      ),
    );

    return ok({ reordered: parsed.data.ids.length });
  } catch (e) {
    return handleError(e);
  }
}
