import type { Metadata } from "next";
import { getPosts } from "@/lib/data";
import { PostCard } from "@/components/home/post-card";
import { Pagination } from "@/components/posts/pagination";
import { SearchForm } from "@/components/posts/search-form";

export const metadata: Metadata = { title: "搜索文章" };

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", page } = await searchParams;
  const pageNum = Number(page) || 1;
  const { posts, total, totalPages } = await getPosts({
    q: q.trim(),
    page: pageNum,
    pageSize: 9,
  });

  return (
    <div className="page-enter mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">搜索文章</h1>
      <div className="mt-5">
        <SearchForm initial={q} />
      </div>

      {q && (
        <p className="mt-6 text-sm text-muted-foreground">
          找到 <span className="font-semibold text-foreground">{total}</span> 篇与「
          {q}」相关的文章
        </p>
      )}

      <div className="mt-6 space-y-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {q && posts.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">没有找到相关内容，换个关键词试试～</p>
        )}
      </div>

      <Pagination
        page={pageNum}
        totalPages={totalPages}
        basePath={`/search?q=${encodeURIComponent(q)}`}
      />
    </div>
  );
}
