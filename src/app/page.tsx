import { getSiteSettings } from "@/lib/settings";
import { getLatestPosts, getHotPosts, getCategories, getTags, getSiteStats } from "@/lib/data";
import { Hero } from "@/components/home/hero";
import { PostCard } from "@/components/home/post-card";
import { TagCloud } from "@/components/home/tag-cloud";
import { VisitTracker } from "@/components/home/visit-tracker";
import { SearchForm } from "@/components/posts/search-form";
import Link from "next/link";
import { Flame, FolderOpen } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, stats, latest, hot, categories, tags] = await Promise.all([
    getSiteSettings(),
    getSiteStats(),
    getLatestPosts(9),
    getHotPosts(5),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="page-enter">
      <VisitTracker />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Hero settings={settings} stats={stats} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* 主列：最新文章 */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">最新文章</h2>
              <Link href="/search?q=" className="text-sm text-muted-foreground hover:text-primary">
                查看全部
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {latest.map((post) => (
                <PostCard key={post.id} post={post} priority={false} />
              ))}
            </div>
          </section>

          {/* 侧栏 */}
          <aside className="space-y-6">
            <SearchForm />

            <section className="rounded-2xl border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Flame className="h-4 w-4 text-orange-500" /> 热门文章
              </h2>
              <ol className="space-y-3">
                {hot.map((post, i) => (
                  <li key={post.id} className="flex gap-3">
                    <span className="text-lg font-bold text-muted-foreground/50">{i + 1}</span>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="line-clamp-2 text-sm leading-snug hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FolderOpen className="h-4 w-4" /> 文章分类
              </h2>
              <div className="space-y-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="flex items-center justify-between text-sm text-muted-foreground transition hover:text-primary"
                  >
                    <span>{c.name}</span>
                    <span className="text-xs opacity-60">{c._count.posts}</span>
                  </Link>
                ))}
              </div>
            </section>

            <TagCloud tags={tags} />
          </aside>
        </div>
      </div>
    </div>
  );
}
