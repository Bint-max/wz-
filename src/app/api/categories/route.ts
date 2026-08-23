import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { categoryController } from "@/server/categories/controller";
import { categoryCreateSchema } from "@/server/categories/schema";

/**
 * GET /api/categories —— 获取分类列表（含文章数）
 */
export async function GET() {
  try {
    const categories = await categoryController.list();
    return ok(categories);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/categories —— 创建分类（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = categoryCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const category = await categoryController.create(parsed.data);
    return ok(category, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
