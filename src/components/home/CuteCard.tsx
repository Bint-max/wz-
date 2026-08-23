/**
 * 卡哇伊文章卡片：手账 / 日记本风格
 */
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { PostListItem } from "@/types";

const PASTELS = [
  "from-pink-100 to-rose-50",
  "from-violet-100 to-purple-50",
  "from-sky-100 to-cyan-50",
  "from-amber-100 to-yellow-50",
  "from-emerald-100 to-teal-50",
];

export function CuteCard({
  post,
  priority = false,
}: {
  post: PostListItem;
  priority?: boolean;
}) {
  const pastel = PASTELS[Math.abs(post.title.charCodeAt(0)) % PASTELS.length];

  return (
    <article className="cute-card-hover group relative flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-white/70 dark:border-white/10 bg-card/90 shadow-soft backdrop-blur">
      {/* 顶部胶带装饰 */}
      <span className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-pink-200/70" />

      <Link href={`/posts/${post.slug}`} className="flex flex-1 flex-col">
        {post.coverImage ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="cute-img-spin object-cover"
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        ) : (
          <div
            className={`relative flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br ${pastel}`}
          >
            <span className="text-5xl drop-shadow-sm">🌸</span>
            <Sparkles className="absolute right-3 top-3 h-4 w-4 text-pink-300" />
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          {post.category && (
            <span className="cute-chip mb-3 w-fit px-3 py-1 text-xs font-medium">
              ✿ {post.category.name}
            </span>
          )}
          <h2 className="font-cute line-clamp-2 text-xl font-semibold leading-snug text-foreground transition group-hover:text-primary">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-3 border-t-2 border-dashed border-pink-100 px-5 py-3 text-xs text-muted-foreground">
        <time className="flex items-center gap-1">📅 {formatDate(post.publishedAt ?? post.createdAt)}</time>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {post.readingTime} 分钟
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5">
          <Eye className="h-3.5 w-3.5" /> {post.views}
        </span>
      </div>

      {/* 角落爱心装饰 */}
      <span className="pointer-events-none absolute -bottom-2 -right-1 rotate-12 text-2xl opacity-40">💗</span>
    </article>
  );
}
