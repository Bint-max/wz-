import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

/**
 * GET /api/stats —— 后台访问数据看板（需登录）
 */
export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();

    const [
      publishedCount,
      draftCount,
      viewSum,
      commentByStatus,
      totalComments,
      visits,
      totalVisits,
      recentPosts,
    ] = await Promise.all([
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.comment.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.comment.count(),
      prisma.visitStat.findMany({ orderBy: { date: "desc" }, take: 14 }),
      prisma.visitStat.aggregate({ _sum: { count: true } }),
      prisma.post.findMany({
        orderBy: { views: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, views: true, published: true },
      }),
    ]);

    return ok({
      posts: { published: publishedCount, draft: draftCount, total: publishedCount + draftCount },
      views: viewSum._sum.views ?? 0,
      comments: {
        total: totalComments,
        pending: commentByStatus.find((c) => c.status === "PENDING")?._count.status ?? 0,
        approved: commentByStatus.find((c) => c.status === "APPROVED")?._count.status ?? 0,
        spam: commentByStatus.find((c) => c.status === "SPAM")?._count.status ?? 0,
      },
      visits: {
        total: totalVisits._sum.count ?? 0,
        daily: visits.reverse(),
      },
      topPosts: recentPosts,
    });
  } catch (e) {
    return handleError(e);
  }
}
