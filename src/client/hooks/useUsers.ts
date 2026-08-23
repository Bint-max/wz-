"use client";

/**
 * 用户管理数据 hook
 */
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/client/api";

export type AdminUser = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: "ADMIN" | "EDITOR" | "USER";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  lastLoginAt: string | null;
  _count: { posts: number };
};

export type UserPatch = {
  username?: string | null;
  name?: string;
  bio?: string | null;
  role?: "ADMIN" | "EDITOR" | "USER";
  status?: "ACTIVE" | "DISABLED";
};

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await apiClient.get<AdminUser[]>("/api/admin/users"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载用户失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateUser = useCallback(
    async (id: string, patch: UserPatch) => {
      await apiClient.put<AdminUser>(`/api/admin/users/${id}`, patch);
      await reload();
    },
    [reload],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await apiClient.delete<{ id: string }>(`/api/admin/users/${id}`);
      await reload();
    },
    [reload],
  );

  return { users, loading, error, reload, updateUser, deleteUser };
}
