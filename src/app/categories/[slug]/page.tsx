import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getCategories } from "@/lib/data";
import { CuteCard } from "@/components/home/CuteCard";
import { Pagination } from "@/components/posts/pagination";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  return { title: category ? category.name : "分类" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const pageNum = Number(page) || 1;
  const { posts, totalPages } = await getPosts({
    categorySlug: slug,
    page: pageNum,
    pageSize: 9,
  });

  return (
    <div className="page-enter mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="font-cute text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">该分类下暂无文章。</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <CuteCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination page={pageNum} totalPages={totalPages} basePath={`/categories/${slug}`} />
    </div>
  );
}
