import { NextRequest } from "next/server";
import { AiArticleStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { listAiArticles } from "@/lib/ai/articles";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/admin/ai/articles?status=&page=&pageSize= —— AI 文章列表（需登录）
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const validStatuses = Object.values(AiArticleStatus) as string[];
    let status: AiArticleStatus | undefined;
    if (statusParam !== null) {
      if (!validStatuses.includes(statusParam)) {
        return fail(`无效的 status 参数，可选值：${validStatuses.join("/")}`);
      }
      status = statusParam as AiArticleStatus;
    }
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 20;

    const result = await listAiArticles({ status, page, pageSize });
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
