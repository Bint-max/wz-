/**
 * 新闻采集：RSS / API 两种来源
 */
import Parser from "rss-parser";

export type ParsedNewsItem = {
  title: string;
  url: string;
  summary: string;
  content: string;
  publishedAt: Date | null;
};

const parser = new Parser();

/** 从 RSS 源采集 */
export async function fetchRss(url: string): Promise<ParsedNewsItem[]> {
  const feed = await parser.parseURL(url);
  return (feed.items ?? []).map((item) => ({
    title: item.title?.trim() ?? "未命名",
    url: item.link?.trim() ?? "",
    summary: item.contentSnippet?.trim() ?? "",
    content: item.content?.trim() ?? item.contentSnippet?.trim() ?? "",
    publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
  }));
}

/** 从通用 JSON API 源采集 */
export async function fetchApi(url: string, config: any): Promise<ParsedNewsItem[]> {
  const res = await fetch(url, {
    headers: config?.headers ?? undefined,
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`新闻 API 请求失败：${res.status}`);
  const json: any = await res.json();

  const itemsPath: string | undefined = config?.itemsPath;
  const list: any[] = itemsPath
    ? itemsPath.split(".").reduce((acc, key) => acc?.[key], json)
    : Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.items)
          ? json.items
          : [];

  if (!Array.isArray(list)) throw new Error("新闻 API 返回格式不正确");

  const map = {
    title: config?.fields?.title ?? "title",
    url: config?.fields?.url ?? "url",
    summary: config?.fields?.summary ?? "summary",
    content: config?.fields?.content ?? "content",
    publishedAt: config?.fields?.publishedAt ?? "publishedAt",
  };

  return list.map((raw) => ({
    title: String(raw[map.title] ?? "").trim() || "未命名",
    url: String(raw[map.url] ?? "").trim(),
    summary: String(raw[map.summary] ?? "").trim(),
    content: String(raw[map.content] ?? "").trim(),
    publishedAt: raw[map.publishedAt] ? new Date(raw[map.publishedAt]) : null,
  }));
}

/** 根据来源类型采集 */
export async function fetchNews(source: {
  type: string;
  url: string;
  config?: unknown;
}): Promise<ParsedNewsItem[]> {
  if (source.type === "API") {
    return fetchApi(source.url, source.config);
  }
  return fetchRss(source.url);
}
