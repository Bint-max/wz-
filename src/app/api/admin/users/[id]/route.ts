import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { userController } from "@/server/users/controller";
import { userUpdateSchema } from "@/server/users/schema";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/users/:id —— 更新用户（需管理员）
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const user = await userController.update(id, parsed.data);
    return ok(user);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/admin/users/:id —— 删除用户（需管理员）
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await userController.remove(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
