import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { aiGenerateSchema } from "@/lib/validation";
import { runGenerate } from "@/lib/jobs/ai-pipeline";
import { ok, fail, handleError } from "@/lib/api";

/**
 * POST /api/admin/ai/generate —— 手动触发 AI 生成
 * body: { newsId?: string, limit?: number }
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const parsed = aiGenerateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const result = await runGenerate(parsed.data);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
