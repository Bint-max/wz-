import { prisma } from "@/lib/prisma";
import { PostTable } from "@/components/admin/post-table";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">文章管理</h1>
        <p className="text-sm text-muted-foreground">发布、编辑与删除文章</p>
      </div>
      <PostTable
        initial={posts.map((p) => ({
          ...p,
          publishedAt: p.publishedAt?.toISOString() ?? null,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
