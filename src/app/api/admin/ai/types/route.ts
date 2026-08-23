import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api";

/**
 * GET /api/admin/ai/types —— 获取已有新闻类型（用于下拉筛选）
 */
export async function GET() {
  try {
    await requireAdmin();
    const [sourceRows, itemRows] = await Promise.all([
      prisma.newsSource.findMany({
        where: { newsType: { not: null } },
        select: { newsType: true },
      }),
      prisma.newsItem.findMany({
        where: { newsType: { not: null } },
        select: { newsType: true },
        distinct: ["newsType"],
      }),
    ]);

    const types = Array.from(
      new Set([
        ...sourceRows.map((r) => r.newsType!).filter(Boolean),
        ...itemRows.map((r) => r.newsType!).filter(Boolean),
      ]),
    ).sort();

    return ok(types);
  } catch (e) {
    return handleError(e);
  }
}
