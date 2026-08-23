import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { newsSourceSchema } from "@/lib/validation";
import { updateNewsSource, deleteNewsSource } from "@/lib/news/sources";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/ai/sources/{id} —— 更新新闻来源
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = newsSourceSchema.partial().safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const source = await updateNewsSource(id, parsed.data);
    return ok(source);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/admin/ai/sources/{id} —— 删除新闻来源
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteNewsSource(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
