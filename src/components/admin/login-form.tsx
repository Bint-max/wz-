"use client";

/**
 * 管理员登录表单（卡哇伊版）
 */
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "登录失败");
      const next = searchParams.get("next") || "/admin/dashboard";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border-2 border-white/70 bg-card/90 p-8 shadow-candy backdrop-blur dark:border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-transparent to-violet-100/40 dark:from-pink-950/30 dark:to-violet-950/30" />
      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-violet-300 text-2xl shadow-soft">
          🎀
        </div>
        <h1 className="font-cute mt-3 text-center text-2xl font-bold">管理员登录</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">登录以管理你的小窝 ✿</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-300" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className="w-full rounded-2xl border-2 border-pink-100 bg-background/70 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-300" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full rounded-2xl border-2 border-pink-100 bg-background/70 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-pink-300 dark:border-pink-500/20"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cute-btn-pop w-full rounded-full bg-gradient-to-r from-pink-400 to-violet-400 py-2.5 text-sm font-medium text-white shadow-soft transition hover:scale-[1.02] hover:opacity-95 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          默认账号：admin@example.com / admin123
        </p>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
