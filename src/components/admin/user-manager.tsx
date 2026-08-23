"use client";

/**
 * 用户管理（卡哇伊版）
 */
import { useState } from "react";
import { Trash2, ShieldCheck } from "lucide-react";
import { useUsers, type AdminUser } from "@/client/hooks/useUsers";

const roleLabels: Record<AdminUser["role"], string> = {
  ADMIN: "管理员",
  EDITOR: "编辑",
  USER: "用户",
};

const statusLabels: Record<AdminUser["status"], string> = {
  ACTIVE: "正常",
  DISABLED: "禁用",
};

export function UserManager() {
  const { users, loading, error, updateUser, deleteUser } = useUsers();
  const [busyId, setBusyId] = useState<string | null>(null);

  const patch = async (id: string, data: Partial<Pick<AdminUser, "role" | "status">>) => {
    setBusyId(id);
    try {
      await updateUser(id, data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新失败");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除该用户吗？此操作不可恢复。")) return;
    setBusyId(id);
    try {
      await deleteUser(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-4 shadow-soft dark:border-white/10">
        <h2 className="font-cute flex items-center gap-2 text-base font-semibold">
          <ShieldCheck className="h-4 w-4 text-violet-400" /> 用户与权限
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          管理后台用户角色与账号状态，防止删除或禁用当前登录账号。
        </p>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">加载中...</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-[1.5rem] border-2 border-white/70 bg-card/90 shadow-soft dark:border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-pink-100 text-xs text-muted-foreground dark:border-white/10">
                <th className="px-4 py-3">用户</th>
                <th className="px-4 py-3">邮箱</th>
                <th className="px-4 py-3">角色</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">文章</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-pink-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-violet-200 text-sm">
                        {u.avatar ? "🌸" : "👤"}
                      </span>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        {u.username && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => patch(u.id, { role: e.target.value as AdminUser["role"] })}
                      className="rounded-full border-2 border-pink-100 bg-background/70 px-2 py-1 text-xs outline-none dark:border-pink-500/20"
                    >
                      <option value="ADMIN">管理员</option>
                      <option value="EDITOR">编辑</option>
                      <option value="USER">用户</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.status === "ACTIVE" ? "text-green-600" : "text-red-500"}>
                      {statusLabels[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{u._count.posts}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => patch(u.id, { status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE" })}
                        disabled={busyId === u.id}
                        className="rounded-full border-2 border-amber-100 px-2 py-1 text-xs text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                      >
                        {u.status === "ACTIVE" ? "禁用" : "启用"}
                      </button>
                      <button
                        onClick={() => remove(u.id)}
                        disabled={busyId === u.id}
                        className="rounded-full border-2 border-red-100 p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
