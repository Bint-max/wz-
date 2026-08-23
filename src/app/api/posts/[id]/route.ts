import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { postController } from "@/server/posts/controller";
import { postCreateSchema } from "@/server/posts/schema";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/posts/:id —— 后台编辑时获取单篇文章（需登录）
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const post = await postController.getById(id);
    return ok(post);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * PUT /api/posts/:id —— 更新文章（需登录）
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = postCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const post = await postController.update(id, parsed.data);
    return ok(post);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/posts/:id —— 删除文章（需登录）
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await postController.remove(id);
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
