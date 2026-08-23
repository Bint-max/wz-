import Link from "next/link";
import { FileText, Eye, MessageSquare, Activity, PenLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { formatNumber, formatDateShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    published,
    drafts,
    viewSum,
    pendingComments,
    totalComments,
    visits,
    totalVisits,
    topPosts,
  ] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.comment.count(),
    prisma.visitStat.findMany({ orderBy: { date: "desc" }, take: 14 }),
    prisma.visitStat.aggregate({ _sum: { count: true } }),
    prisma.post.findMany({
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true, published: true },
    }),
  ]);

  const daily = visits.reverse();
  const maxCount = Math.max(1, ...daily.map((v) => v.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数据看板</h1>
        <p className="text-sm text-muted-foreground">博客内容与访问概览</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="已发布文章" value={published} icon={FileText} hint={`草稿 ${drafts} 篇`} />
        <StatCard label="总阅读量" value={formatNumber(viewSum._sum.views ?? 0)} icon={Eye} />
        <StatCard label="评论总数" value={totalComments} icon={MessageSquare} hint={`${pendingComments} 条待审核`} />
        <StatCard label="站点访问量" value={formatNumber(totalVisits._sum.count ?? 0)} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* 近 14 天访问柱状图 */}
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">近 14 天访问量</h2>
          <div className="flex h-44 items-end gap-2">
            {daily.map((v) => (
              <div key={v.id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${Math.max(4, (v.count / maxCount) * 100)}%` }}
                  title={`${v.count} 次访问`}
                />
                <span className="text-[10px] text-muted-foreground">
                  {formatDateShort(v.date).slice(5)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 热门文章 Top 5 */}
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">热门文章 Top 5</h2>
          <ol className="space-y-3">
            {topPosts.map((p, i) => (
              <li key={p.id} className="flex items-start gap-2">
                <span className="text-sm font-bold text-muted-foreground/50">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="line-clamp-1 text-sm hover:text-primary"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.views} 阅读 · {p.published ? "已发布" : "草稿"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/admin/posts/new"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <PenLine className="h-4 w-4" /> 写新文章
          </Link>
        </section>
      </div>
    </div>
  );
}
