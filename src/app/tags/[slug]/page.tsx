import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getTags } from "@/lib/data";
import { PostCard } from "@/components/home/post-card";
import { Pagination } from "@/components/posts/pagination";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === slug);
  return { title: tag ? `标签：${tag.name}` : "标签" };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) notFound();

  const pageNum = Number(page) || 1;
  const { posts, totalPages } = await getPosts({ tagSlug: slug, page: pageNum, pageSize: 9 });

  return (
    <div className="page-enter mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">标签：{tag.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">共 {tag._count.posts} 篇文章</p>
      </header>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">该标签下暂无文章。</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination page={pageNum} totalPages={totalPages} basePath={`/tags/${slug}`} />
    </div>
  );
}
