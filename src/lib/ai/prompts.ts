/**
 * AI 文章生成提示词
 */
import type { SiteSettings } from "@/lib/settings";

export type NewsForPrompt = {
  title: string;
  summary: string;
  content: string;
  url: string;
  sourceName: string;
};

export function buildArticlePrompt(news: NewsForPrompt, site?: SiteSettings) {
  const system = `你是一名资深中文科技博主，负责把互联网热点新闻改写成原创博客文章。
写作要求：
1. 使用简体中文，正文 1000 字左右。
2. 使用 Markdown 格式，包含 3~5 个二级标题（##）。
3. 不得直接复制新闻原文，必须用自己的话重新组织表达。
4. 必须保留新闻中的关键事实（时间、地点、数据、人物、事件）。
5. 在事实基础上增加你的分析、观点和延伸思考。
6. 标题要有吸引力，适合 SEO，避免标题党。
7. 最终只输出一个 JSON 对象，不要输出任何多余文字。

JSON 结构如下：
{
  "title": "SEO 标题",
  "summary": "60~120 字的文章摘要",
  "content": "Markdown 正文",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "tags": ["标签1", "标签2"],
  "category": "建议分类名，从给定分类中选择，若都不匹配可留空字符串"
}`;

  const user = `博客定位：${site?.siteDescription ?? "技术分享与个人思考"}（站点名：${site?.siteName ?? "个人博客"}）
新闻来源：${news.sourceName}
新闻标题：${news.title}
新闻链接：${news.url}
新闻摘要：${news.summary || "无"}
新闻正文：${news.content || "无"}

请基于以上新闻创作文章。`;

  return { system, user };
}

/** 从模型输出中稳健地提取 JSON 对象 */
export function parseJsonFromText(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI 返回内容不是有效 JSON");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}
