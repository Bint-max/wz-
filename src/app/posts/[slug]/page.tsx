import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye, Tag, CalendarDays } from "lucide-react";
import { getPostBySlug, getPostMeta, getHotPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { CommentSection } from "@/components/posts/comment-section";
import { PostCard } from "@/components/home/post-card";

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
      {/* 文章头部 */}
      <header>
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {post.category.name}
          </Link>
        )}
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4 border-b pb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {post.author.name.slice(0, 1)}
            </span>
            {post.author.name}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {formatDate(post.publishedAt ?? post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {post.readingTime} 分钟
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {post.views} 阅读
          </span>
        </div>
      </header>

      {/* 封面 */}
      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
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

      {/* 正文 */}
      <div className="mt-8">
        <Markdown content={post.content} />
      </div>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      <CommentSection postId={post.id} comments={post.comments} />

      {/* 相关推荐 */}
      <section className="mt-14">
        <h2 className="mb-5 text-xl font-bold">相关阅读</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {related
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3)
            .map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
        </div>
      </section>
    </article>
  );
}
