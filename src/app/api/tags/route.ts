import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { tagController } from "@/server/tags/controller";
import { tagCreateSchema } from "@/server/tags/schema";

/**
 * GET /api/tags —— 获取标签列表（含文章数）
 */
export async function GET() {
  try {
    const tags = await tagController.list();
    return ok(tags);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/tags —— 创建标签（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = tagCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const tag = await tagController.create(parsed.data);
    return ok(tag, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
