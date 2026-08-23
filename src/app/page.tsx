import { getSiteSettings } from "@/lib/settings";
import { getLatestPosts, getHotPosts, getCategories, getTags, getSiteStats } from "@/lib/data";
import { Hero } from "@/components/home/hero";
import { CuteCard } from "@/components/home/CuteCard";
import { TagCloud } from "@/components/home/tag-cloud";
import { VisitTracker } from "@/components/home/visit-tracker";
import { SearchForm } from "@/components/posts/search-form";
import Link from "next/link";
import { Flame, FolderOpen, Sparkles } from "lucide-react";

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
              <h2 className="font-cute flex items-center gap-2 text-xl font-bold">
                <Sparkles className="h-5 w-5 text-pink-400" /> 最新文章
              </h2>
              <Link href="/search?q=" className="text-sm text-muted-foreground hover:text-primary">
                看看全部 →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {latest.map((post) => (
                <CuteCard key={post.id} post={post} />
              ))}
            </div>
          </section>

          {/* 侧栏 */}
          <aside className="space-y-6">
            <SearchForm />

            <section className="rounded-[1.5rem] border-2 border-white/70 dark:border-white/10 bg-card/90 p-5 shadow-soft">
              <h2 className="font-cute mb-3 flex items-center gap-2 text-base font-semibold">
                <Flame className="h-4 w-4 text-orange-400" /> 热门文章
              </h2>
              <ol className="space-y-3">
                {hot.map((post, i) => (
                  <li key={post.id} className="flex gap-3">
                    <span className="font-cute text-lg font-bold text-pink-300">{i + 1}</span>
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

            <section className="rounded-[1.5rem] border-2 border-white/70 dark:border-white/10 bg-card/90 p-5 shadow-soft">
              <h2 className="font-cute mb-3 flex items-center gap-2 text-base font-semibold">
                <FolderOpen className="h-4 w-4 text-violet-400" /> 文章分类
              </h2>
              <div className="space-y-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="flex items-center justify-between text-sm text-muted-foreground transition hover:translate-x-1 hover:text-primary"
                  >
                    <span>🌸 {c.name}</span>
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs">{c._count.posts}</span>
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
