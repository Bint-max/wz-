"use client";

/**
 * 标签数据 hook（供后续标签管理页面使用）
 */
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/client/api";

export type Tag = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
};

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTags(await apiClient.get<Tag[]>("/api/tags"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载标签失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createTag = useCallback(
    async (name: string) => {
      await apiClient.post<Tag>("/api/tags", { name });
      await reload();
    },
    [reload],
  );

  const updateTag = useCallback(
    async (id: string, name: string) => {
      await apiClient.put<Tag>(`/api/tags/${id}`, { name });
      await reload();
    },
    [reload],
  );

  const deleteTag = useCallback(
    async (id: string) => {
      await apiClient.delete<{ id: string }>(`/api/tags/${id}`);
      await reload();
    },
    [reload],
  );

  return { tags, loading, error, reload, createTag, updateTag, deleteTag };
}
