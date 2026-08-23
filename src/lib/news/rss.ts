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

/** 判断内容是否为网页 HTML（而非 RSS/JSON） */
function isHtml(text: string): boolean {
  return /<!DOCTYPE|<html/i.test(text.slice(0, 4000));
}

/** 从 RSS 源采集 */
export async function fetchRss(url: string): Promise<ParsedNewsItem[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`RSS 请求失败：HTTP ${res.status}`);

  const text = await res.text();
  if (!text.trim()) {
    throw new Error("该地址返回内容为空，可能已失效或被反爬拦截，请更换来源");
  }
  if (isHtml(text)) {
    throw new Error("该地址返回的是网页（HTML），不是 RSS 源。请填写真正的 RSS 地址（如 xxx/feed 或 xxx/rss.xml）");
  }

  let feed;
  try {
    feed = await parser.parseString(text);
  } catch (e) {
    throw new Error(
      `RSS 解析失败：${e instanceof Error ? e.message : String(e)}。请确认地址是有效的 RSS/Atom 源`,
    );
  }

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

  const text = await res.text();
  if (isHtml(text)) {
    throw new Error("该地址返回的是网页（HTML），不是 JSON API。请填写真正返回 JSON 的接口地址");
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(
      `JSON 解析失败：${e instanceof Error ? e.message : String(e)}。请确认地址返回的是 JSON 数据`,
    );
  }

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
