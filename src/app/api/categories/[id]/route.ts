import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/categories/:id —— 更新分类
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug ? slugify(data.slug) : undefined,
        description: data.description || null,
        sortOrder: data.sortOrder,
      },
    });
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
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.category.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
