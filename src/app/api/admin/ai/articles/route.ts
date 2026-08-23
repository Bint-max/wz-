import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listAiArticles } from "@/lib/ai/articles";
import { ok, handleError } from "@/lib/api";

/**
 * GET /api/admin/ai/articles?status=&page=&pageSize= —— AI 文章列表（需登录）
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const status = statusParam === null ? undefined : Number(statusParam);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 20;

    const result = await listAiArticles({ status, page, pageSize });
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
