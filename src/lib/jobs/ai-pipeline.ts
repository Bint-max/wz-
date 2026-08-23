/**
 * AI 内容生产流水线：
 * 采集新闻 -> 筛选热点 -> AI 生成 -> 保存草稿 -> 通知管理员
 */
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { hashUrl } from "@/lib/news/dedupe";
import { fetchNews } from "@/lib/news/rss";
import { getAiClient, getAiModel } from "@/lib/ai/client";
import { buildArticlePrompt, parseJsonFromText } from "@/lib/ai/prompts";
import { aiArticleOutputSchema } from "@/lib/validation";
import { createAiArticle, findAiArticleByNews } from "@/lib/ai/articles";
import { notifyAdmin } from "@/lib/notify";
import { slugify } from "@/lib/utils";

/** 采集新闻（sourceId 可选，只采集指定来源） */
export async function collectNews(sourceId?: string) {
  const sources = await prisma.newsSource.findMany({
    where: { ...(sourceId ? { id: sourceId } : { enabled: true }) },
  });

  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const source of sources) {
    try {
      const items = await fetchNews(source);
      for (const item of items) {
        if (!item.url) continue;
        const urlHash = hashUrl(item.url);
        const existing = await prisma.newsItem.findUnique({ where: { urlHash } });
        if (existing) {
          await prisma.newsItem.update({
            where: { id: existing.id },
            data: {
              title: item.title,
              summary: item.summary,
              content: item.content || existing.content,
              publishedAt: item.publishedAt ?? existing.publishedAt,
            },
          });
          updated++;
        } else {
          await prisma.newsItem.create({
            data: {
              sourceId: source.id,
              title: item.title,
              url: item.url,
              urlHash,
              summary: item.summary,
              content: item.content,
              publishedAt: item.publishedAt,
            },
          });
          created++;
        }
      }
      await prisma.newsSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date() },
      });
    } catch (e) {
      failed++;
      errors.push(`${source.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { created, updated, failed, errors };
}

/** 为单条新闻生成 AI 文章 */
export async function generateFromNews(newsItemId: string) {
  const news = await prisma.newsItem.findUnique({
    where: { id: newsItemId },
    include: { source: true },
  });
  if (!news) throw new Error("新闻不存在");

  const dup = await findAiArticleByNews(newsItemId);
  if (dup) throw new Error("该新闻已生成过文章，请勿重复生成");

  const settings = await getSiteSettings();
  const { system, user } = buildArticlePrompt(
    {
      title: news.title,
      summary: news.summary ?? "",
      content: news.content ?? "",
      url: news.url,
      sourceName: news.source.name,
    },
    settings,
  );

  const client = getAiClient();
  const completion = await client.chat.completions.create({
    model: getAiModel(),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.75,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  const parsed = parseJsonFromText(raw);
  const output = aiArticleOutputSchema.parse(parsed);

  if (!output.content || output.content.trim().length < 300) {
    throw new Error("AI 生成的正文过短，疑似生成失败");
  }

  // 匹配建议分类：优先按名称/slug 匹配，否则使用来源默认分类
  let suggestedCategoryId = news.source.defaultCategoryId ?? null;
  const categoryName = (output.category ?? "").trim();
  if (categoryName) {
    const cat = await prisma.category.findFirst({
      where: { OR: [{ name: categoryName }, { slug: slugify(categoryName) }] },
    });
    if (cat) suggestedCategoryId = cat.id;
  }

  const article = await createAiArticle({
    newsItemId: news.id,
    title: output.title,
    summary: output.summary,
    content: output.content,
    keywords: output.keywords,
    tags: output.tags,
    suggestedCategoryId,
    sourceUrl: news.url,
    model: getAiModel(),
    tokenUsage: completion.usage?.total_tokens,
  });

  await prisma.newsItem.update({ where: { id: news.id }, data: { used: true } });

  return article;
}

/** 批量生成：指定 newsId 或从最新新闻中取 limit 条 */
export async function runGenerate(opts: { newsId?: string; limit?: number } = {}) {
  const results = { success: 0, failed: 0, ids: [] as string[], errors: [] as string[] };

  if (opts.newsId) {
    try {
      const article = await generateFromNews(opts.newsId);
      results.success++;
      results.ids.push(article.id);
    } catch (e) {
      results.failed++;
      results.errors.push(e instanceof Error ? e.message : String(e));
    }
    return results;
  }

  const limit = Math.min(20, Math.max(1, opts.limit ?? 3));
  const candidates = await prisma.newsItem.findMany({
    where: { used: false },
    orderBy: [{ publishedAt: "desc" }, { fetchedAt: "desc" }],
    take: limit * 3, // 多取一些，跳过已生成过的
    include: { source: true },
  });

  for (const news of candidates) {
    if (results.success >= limit) break;
    try {
      const article = await generateFromNews(news.id);
      results.success++;
      results.ids.push(article.id);
    } catch (e) {
      results.failed++;
      results.errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  return results;
}

/** 每日自动流水线 */
export async function runDailyPipeline() {
  const log = await prisma.aiRunLog.create({
    data: { runType: "DAILY", status: "RUNNING", startedAt: new Date() },
  });

  let collected = { created: 0, updated: 0, failed: 0 };
  let generated = { success: 0, failed: 0, ids: [] as string[], errors: [] as string[] };

  try {
    collected = await collectNews();
    const dailyLimit = Number(process.env.AI_DAILY_LIMIT ?? 3);
    generated = await runGenerate({ limit: dailyLimit });

    const totalItems = collected.created + collected.updated;
    const successCount = generated.success;
    const errorCount = generated.failed;
    const message = `采集新闻 ${totalItems} 条（新增 ${collected.created}）；AI 生成 ${generated.success} 篇，失败 ${generated.failed} 篇`;

    await prisma.aiRunLog.update({
      where: { id: log.id },
      data: {
        status: errorCount > 0 && generated.success > 0 ? "PARTIAL" : errorCount > 0 ? "FAILED" : "SUCCESS",
        endedAt: new Date(),
        totalItems,
        successCount,
        errorCount,
        message,
      },
    });

    await notifyAdmin(
      `【AI 内容生产】采集 ${totalItems} 条新闻，生成 ${generated.success} 篇草稿，请登录后台审核：/admin/ai-articles`,
    );

    return { collected, generated, logId: log.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.aiRunLog.update({
      where: { id: log.id },
      data: { status: "FAILED", endedAt: new Date(), errorCount: 1, message: msg },
    });
    throw e;
  }
}
