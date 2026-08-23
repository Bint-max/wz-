/**
 * 新闻来源数据访问层
 */
import { prisma } from "@/lib/prisma";

export async function listNewsSources() {
  return prisma.newsSource.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createNewsSource(data: {
  name: string;
  type: "RSS" | "API";
  url: string;
  enabled?: boolean;
  newsType?: string | null;
  defaultCategoryId?: string | null;
  defaultTags?: string[];
  config?: Record<string, unknown> | null;
}) {
  return prisma.newsSource.create({
    data: {
      name: data.name,
      type: data.type,
      url: data.url,
      enabled: data.enabled ?? true,
      newsType: data.newsType || null,
      defaultCategoryId: data.defaultCategoryId || null,
      defaultTags: data.defaultTags ?? [],
      config: (data.config ?? undefined) as any,
    },
  });
}

export async function updateNewsSource(
  id: string,
  data: {
    name?: string;
    type?: "RSS" | "API";
    url?: string;
    enabled?: boolean;
    newsType?: string | null;
    defaultCategoryId?: string | null;
    defaultTags?: string[];
    config?: Record<string, unknown> | null;
  },
) {
  return prisma.newsSource.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      url: data.url,
      enabled: data.enabled,
      newsType: data.newsType,
      defaultCategoryId: data.defaultCategoryId,
      defaultTags: data.defaultTags,
      config: data.config === undefined ? undefined : (data.config as any),
    },
  });
}

export async function deleteNewsSource(id: string) {
  return prisma.newsSource.delete({ where: { id } });
}
