"use client";

/**
 * 分类数据 hook：封装列表/新增/更新/删除，供前台与后台复用。
 * 当前使用轻量 fetch + useState 实现；后续可替换为 TanStack Query。
 */
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/client/api";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { posts: number };
};

export type CategoryPayload = {
  name: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Category[]>("/api/categories");
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载分类失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createCategory = useCallback(
    async (payload: CategoryPayload) => {
      await apiClient.post<Category>("/api/categories", payload);
      await reload();
    },
    [reload],
  );

  const updateCategory = useCallback(
    async (id: string, payload: Partial<CategoryPayload>) => {
      await apiClient.put<Category>(`/api/categories/${id}`, payload);
      await reload();
    },
    [reload],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await apiClient.delete<{ id: string }>(`/api/categories/${id}`);
      await reload();
    },
    [reload],
  );

  return { categories, loading, error, reload, createCategory, updateCategory, deleteCategory };
}
