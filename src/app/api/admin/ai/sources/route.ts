import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { newsSourceSchema } from "@/lib/validation";
import { listNewsSources, createNewsSource } from "@/lib/news/sources";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/admin/ai/sources —— 新闻来源列表
 */
export async function GET() {
  try {
    await requireAdmin();
    const sources = await listNewsSources();
    return ok(sources);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/admin/ai/sources —— 新增新闻来源
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = newsSourceSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const source = await createNewsSource(parsed.data);
    return ok(source, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
