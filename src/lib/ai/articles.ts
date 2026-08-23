/**
 * AI 文章数据访问层 + 发布逻辑
 */
import { prisma } from "@/lib/prisma";
import { slugify, estimateReadingTime } from "@/lib/utils";

/** AI 文章列表 */
export async function listAiArticles(opts: { status?: number; page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? 20));
  const where = opts.status === undefined ? {} : { status: opts.status };

  const [items, total] = await Promise.all([
    prisma.aiArticle.findMany({
      where,
      include: {
        newsItem: { select: { title: true, url: true, newsType: true, source: { select: { name: true } } } },
        category: { select: { id: true, name: true, slug: true } },
        post: { select: { id: true, slug: true, published: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.aiArticle.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

/** AI 文章详情 */
export async function getAiArticle(id: string) {
  return prisma.aiArticle.findUnique({
    where: { id },
    include: {
      newsItem: { include: { source: true } },
      category: true,
      post: true,
    },
  });
}

/** 更新 AI 文章（审核编辑） */
export async function updateAiArticle(
  id: string,
  data: {
    title?: string;
    summary?: string | null;
    content?: string;
    keywords?: string[];
    tags?: string[];
    suggestedCategoryId?: string | null;
    sourceUrl?: string | null;
  },
) {
  return prisma.aiArticle.update({
    where: { id },
    data: {
      title: data.title,
      summary: data.summary,
      content: data.content,
      keywords: data.keywords,
      tags: data.tags,
      suggestedCategoryId: data.suggestedCategoryId,
      sourceUrl: data.sourceUrl,
    },
  });
}

/** 删除 AI 文章 */
export async function deleteAiArticle(id: string) {
  return prisma.aiArticle.delete({ where: { id } });
}

/** 创建 AI 文章 */
export async function createAiArticle(data: {
  newsItemId?: string | null;
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  tags: string[];
  suggestedCategoryId?: string | null;
  sourceUrl?: string | null;
  model?: string;
  tokenUsage?: number;
}) {
  const slug = await uniqueAiSlug(data.title);
  return prisma.aiArticle.create({
    data: {
      newsItemId: data.newsItemId || null,
      title: data.title,
      slug,
      summary: data.summary,
      content: data.content,
      keywords: data.keywords,
      tags: data.tags,
      suggestedCategoryId: data.suggestedCategoryId || null,
      sourceUrl: data.sourceUrl || null,
      model: data.model,
      tokenUsage: data.tokenUsage,
      status: 0,
    },
  });
}

/** 判断某条新闻是否已生成过文章 */
export async function findAiArticleByNews(newsItemId: string) {
  return prisma.aiArticle.findUnique({ where: { newsItemId } });
}

/** 生成唯一 slug */
export async function uniqueAiSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base) || "ai-article";
  let i = 2;
  while (true) {
    const existing = await prisma.aiArticle.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${slugify(base) || "ai-article"}-${i++}`;
  }
}

/** 将 AI 文章发布到博客 Post 表 */
export async function publishAiArticle(id: string, authorId: string) {
  const article = await prisma.aiArticle.findUnique({ where: { id } });
  if (!article) throw new Error("AI 文章不存在");
  if (article.status === 1 && article.postId) {
    const post = await prisma.post.findUnique({ where: { id: article.postId } });
    if (post) return post;
  }

  const post = await prisma.$transaction(async (tx) => {
    const slug = await uniquePostSlug(tx, article.title);

    // 将建议标签同步为博客 Tag
    const tagIds: string[] = [];
    for (const name of article.tags) {
      const tagSlug = slugify(name);
      if (!tagSlug) continue;
      const tag = await tx.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name, slug: tagSlug },
      });
      tagIds.push(tag.id);
    }

    const created = await tx.post.create({
      data: {
        title: article.title,
        slug,
        excerpt: article.summary || null,
        content: article.content,
        published: true,
        aiGenerated: true,
        readingTime: estimateReadingTime(article.content),
        publishedAt: new Date(),
        categoryId: article.suggestedCategoryId || null,
        authorId,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });

    await tx.aiArticle.update({
      where: { id: article.id },
      data: { status: 1, postId: created.id, publishedAt: new Date() },
    });

    return created;
  });

  return post;
}

async function uniquePostSlug(tx: any, base: string): Promise<string> {
  let slug = slugify(base) || "ai-article";
  let i = 2;
  while (true) {
    const existing = await tx.post.findFirst({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
    slug = `${slugify(base) || "ai-article"}-${i++}`;
  }
}
