"use client";

/**
 * 文件/媒体管理数据 hook
 */
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/client/api";

export type MediaItem = {
  id: string;
  kind: "IMAGE" | "AUDIO" | "LYRIC" | "COVER";
  driver: string;
  storageKey: string | null;
  url: string;
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  hash: string | null;
  createdAt: string;
  uploader: { name: string } | null;
};

export function useMedia() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMedia(await apiClient.get<MediaItem[]>("/api/admin/media"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载文件失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const deleteMedia = useCallback(
    async (id: string) => {
      await apiClient.delete<{ id: string }>(`/api/admin/media/${id}`);
      await reload();
    },
    [reload],
  );

  return { media, loading, error, reload, deleteMedia };
}
