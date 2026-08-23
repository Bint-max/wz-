import { NextResponse } from "next/server";
import { getLatestPosts } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

/**
 * RSS 2.0 订阅源
 */
export async function GET() {
  const [posts, settings] = await Promise.all([getLatestPosts(20), getSiteSettings()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${base}/posts/${post.slug}</link>
      <guid isPermaLink="true">${base}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt ?? ""}]]></description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${settings.siteTitle}]]></title>
    <link>${base}</link>
    <description><![CDATA[${settings.siteDescription}]]></description>
    <language>zh-CN</language>
    <atom:link href="${base}/api/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
