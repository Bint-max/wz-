import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { publishArticleSchema } from "@/lib/validation";
import { publishAiArticle } from "@/lib/ai/articles";
import { ok, fail, handleError } from "@/lib/api";

/**
 * POST /api/admin/articles/publish —— 发布 AI 文章到博客
 * body: { id: AiArticle.id }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = publishArticleSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const post = await publishAiArticle(parsed.data.id, admin.id);
    return ok(post);
  } catch (e) {
    return handleError(e);
  }
}
