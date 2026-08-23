import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { aiArticleUpdateSchema } from "@/lib/validation";
import { getAiArticle, updateAiArticle, deleteAiArticle } from "@/lib/ai/articles";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/ai/articles/{id} —— AI 文章详情
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const article = await getAiArticle(id);
    if (!article) return fail("文章不存在", 404);
    return ok(article);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * PUT /api/admin/ai/articles/{id} —— 编辑 AI 文章
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = aiArticleUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const article = await updateAiArticle(id, parsed.data);
    return ok(article);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/admin/ai/articles/{id} —— 删除 AI 文章
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteAiArticle(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
