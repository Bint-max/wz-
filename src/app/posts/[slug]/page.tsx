import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye, Tag, CalendarDays, Sparkles } from "lucide-react";
import { getPostBySlug, getPostMeta, getHotPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { CommentSection } from "@/components/posts/comment-section";
import { CuteCard } from "@/components/home/CuteCard";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostMeta(slug);
  if (!post || !post.published) return { title: "文章不存在" };
  const tags = post.tags.map((t) => t.tag.name).join(", ");
  return {
    title: post.title,
    description: post.excerpt ?? post.title,
    keywords: tags.split(", "),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      section: post.category?.name,
      tags: tags.split(", "),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getHotPosts(3);

  return (
    <article className="page-enter mx-auto max-w-3xl px-4 py-8">
      {/* 文章头部：手账便签风格 */}
      <header className="relative overflow-hidden rounded-[2rem] border-2 border-white/70 bg-card/90 p-7 shadow-soft dark:border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-transparent to-violet-100/40 dark:from-pink-950/30 dark:to-violet-950/30" />
        <Sparkles className="absolute right-5 top-5 h-5 w-5 text-pink-300" />

        <div className="relative">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="cute-chip inline-flex px-3 py-1 text-xs font-medium"
            >
              ✿ {post.category.name}
            </Link>
          )}
          <h1 className="font-cute mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t-2 border-dashed border-pink-100 pt-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-violet-300 text-xs font-bold text-white">
                {post.author.name.slice(0, 1)}
              </span>
              {post.author.name}
            </span>
            <span className="flex items-center gap-1">📅 {formatDate(post.publishedAt ?? post.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-pink-400" /> {post.readingTime} 分钟
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-violet-400" /> {post.views} 阅读
            </span>
          </div>
        </div>
      </header>

      {/* 封面 */}
      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[1.75rem] border-2 border-white/70 shadow-soft dark:border-white/10">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 正文（保持 Markdown 专业排版） */}
      <div className="mt-8 rounded-[1.75rem] border-2 border-white/70 bg-card/80 p-6 shadow-soft dark:border-white/10 sm:p-8">
        <Markdown content={post.content} />
      </div>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-pink-400" />
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="cute-chip px-3 py-1 text-xs font-medium"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <CommentSection postId={post.id} comments={post.comments} />

      {/* 相关推荐 */}
      <section className="mt-14">
        <h2 className="font-cute mb-5 flex items-center gap-2 text-xl font-bold">
          <Sparkles className="h-5 w-5 text-pink-400" /> 相关阅读
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {related
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3)
            .map((p) => (
              <CuteCard key={p.id} post={p} />
            ))}
        </div>
      </section>
    </article>
  );
}
