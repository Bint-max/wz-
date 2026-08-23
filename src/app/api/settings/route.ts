import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { settingsController } from "@/server/settings/controller";
import { settingsUpdateSchema } from "@/server/settings/schema";

/**
 * GET /api/settings —— 获取站点设置（公开）
 */
export async function GET() {
  try {
    const settings = await settingsController.list();
    return ok(settings);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/settings —— 批量更新站点设置（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const result = await settingsController.update(parsed.data);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
