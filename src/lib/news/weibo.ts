/**
 * 微博热搜直连采集
 * 使用后台配置的微博 Cookie（自动获取），不依赖 RSSHub 微博路由。
 */
import type { ParsedNewsItem } from "./rss";

export async function fetchWeiboHot(cookie: string): Promise<ParsedNewsItem[]> {
  if (!cookie) {
    throw new Error("未配置微博 Cookie，请先在「AI 设置」中保存微博 Cookie");
  }

  const res = await fetch("https://weibo.com/ajax/side/hotSearch", {
    headers: {
      Cookie: cookie,
      Referer: "https://weibo.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`微博热搜请求失败：HTTP ${res.status}（Cookie 可能失效）`);
  }

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`微博热搜返回格式错误：${e instanceof Error ? e.message : String(e)}`);
  }

  const realtime: any[] = json?.data?.realtime ?? [];
  if (!Array.isArray(realtime) || realtime.length === 0) {
    throw new Error("微博热搜返回为空（Cookie 可能失效或未登录）");
  }

  return realtime.map((item) => {
    const word = String(item.word ?? item.note ?? "").trim();
    return {
      title: word,
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(word)}`,
      summary: String(item.note ?? "").trim(),
      content: String(item.note ?? "").trim(),
      publishedAt: new Date(),
    };
  });
}
