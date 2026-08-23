import type { MetadataRoute } from "next";
import { getAllPostSlugs, getCategories, getTags } from "@/lib/data";

/**
 * 动态站点地图（SEO）
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [posts, categories, tags] = await Promise.all([
    getAllPostSlugs(),
    getCategories(),
    getTags(),
  ]);

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tags`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const tagRoutes = tags.map((t) => ({
    url: `${base}/tags/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${base}/posts/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...tagRoutes, ...postRoutes];
}
