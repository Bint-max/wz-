"use client";

/**
 * 站点设置数据 hook
 */
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/client/api";

export type SiteSettings = Record<string, string>;

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSettings(await apiClient.get<SiteSettings>("/api/settings"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载设置失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateSettings = useCallback(
    async (values: Record<string, unknown>) => {
      const result = await apiClient.put<{ updated: number }>("/api/settings", values);
      await reload();
      return result;
    },
    [reload],
  );

  return { settings, setSettings, loading, error, reload, updateSettings };
}
