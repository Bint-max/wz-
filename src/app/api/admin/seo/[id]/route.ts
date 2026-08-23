import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { seoController } from "@/server/seo/controller";

type Ctx = { params: Promise<{ id: string }> };

/**
 * DELETE /api/admin/seo/:id —— 删除 SEO 覆盖配置（需管理员）
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await seoController.remove(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
