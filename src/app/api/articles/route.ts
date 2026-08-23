import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api";

/**
 * GET /api/articles —— 获取文章列表
 * 返回已发布的博客文章（分页）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where: { published: true } }),
    ]);

    return ok({
      items: items.map((p) => ({ ...p, tags: p.tags.map((t) => t.tag) })),
      total,
      page,
      pageSize,
    });
  } catch (e) {
    return handleError(e);
  }
}
