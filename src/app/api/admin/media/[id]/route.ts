import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { mediaController } from "@/server/media/controller";

type Ctx = { params: Promise<{ id: string }> };

/**
 * DELETE /api/admin/media/:id —— 删除文件记录（需管理员）
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await mediaController.remove(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
