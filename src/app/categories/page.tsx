import Link from "next/link";
import { getCategories } from "@/lib/data";

export const revalidate = 60;

export const metadata = { title: "文章分类" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="page-enter mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold">文章分类</h1>
      <p className="mt-2 text-sm text-muted-foreground">按主题浏览所有内容</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold group-hover:text-primary">{c.name}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {c._count.posts} 篇
              </span>
            </div>
            {c.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
