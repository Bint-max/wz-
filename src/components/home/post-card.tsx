/**
 * 文章卡片
 */
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { PostListItem } from "@/types";

export function PostCard({ post, priority = false }: { post: PostListItem; priority?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/posts/${post.slug}`} className="flex-1">
        {post.coverImage ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent text-4xl font-bold text-primary/60">
            {post.title.slice(0, 1)}
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          {post.category && (
            <span className="mb-2 w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-primary">
              {post.category.name}
            </span>
          )}
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-4 border-t px-5 py-3 text-xs text-muted-foreground">
        <time>{formatDate(post.publishedAt ?? post.createdAt)}</time>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {post.readingTime} 分钟
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" /> {post.views}
        </span>
      </div>
    </article>
  );
}
