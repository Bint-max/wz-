import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tagSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/tags/:id —— 更新标签
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const tag = await prisma.tag.update({
      where: { id },
      data: { name: data.name, slug: slugify(data.name) },
    });
    return ok(tag);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/tags/:id —— 删除标签
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.tag.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
