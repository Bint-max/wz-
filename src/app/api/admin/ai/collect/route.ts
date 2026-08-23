import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { collectNews } from "@/lib/jobs/ai-pipeline";
import { ok, handleError } from "@/lib/api";

/**
 * POST /api/admin/ai/collect —— 手动触发新闻采集
 * body: { sourceId?: string, type?: string }
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const result = await collectNews(body?.sourceId, body?.type);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
