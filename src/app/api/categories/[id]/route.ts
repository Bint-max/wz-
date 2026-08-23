import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { categoryController } from "@/server/categories/controller";
import { categoryUpdateSchema } from "@/server/categories/schema";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/categories/:id —— 更新分类
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = categoryUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const category = await categoryController.update(id, parsed.data);
    return ok(category);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/categories/:id —— 删除分类（其下文章分类置空）
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await categoryController.remove(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
