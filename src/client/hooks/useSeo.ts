"use client";

/**
 * SEO 配置数据 hook
 */
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/client/api";

export type SeoSite = {
  entityType: string;
  entityId: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  ogImage: string | null;
  canonical: string | null;
};

export type SeoMetaItem = SeoSite & { id: string; updatedAt: string };

export function useSeo() {
  const [site, setSite] = useState<SeoSite | null>(null);
  const [items, setItems] = useState<SeoMetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<{ site: SeoSite; items: SeoMetaItem[] }>("/api/admin/seo");
      setSite(data.site);
      setItems(data.items.filter((i) => i.entityType !== "site"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载 SEO 配置失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateSite = useCallback(
    async (payload: Partial<SeoSite>) => {
      await apiClient.put<SeoSite>("/api/admin/seo", payload);
      await reload();
    },
    [reload],
  );

  const deleteMeta = useCallback(
    async (id: string) => {
      await apiClient.delete<{ id: string }>(`/api/admin/seo/${id}`);
      await reload();
    },
    [reload],
  );

  return { site, items, loading, error, reload, updateSite, deleteMeta };
}
