"use client";

/**
 * 后台整体布局壳（卡哇伊版）
 */
import Link from "next/link";
import { AdminNav, AdminLogout } from "./admin-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-4 py-6">
      <aside className="hidden w-52 shrink-0 md:block">
        <div className="sticky top-6 rounded-[1.75rem] border-2 border-white/70 bg-card/90 p-3 shadow-soft dark:border-white/10">
          <Link
            href="/admin/dashboard"
            className="font-cute mb-3 flex items-center gap-2 px-3 py-2 text-base font-bold text-primary"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-violet-300 text-sm">
              🎀
            </span>
            博客后台
          </Link>
          <AdminNav />
          <div className="mt-3 border-t border-pink-100 pt-3 dark:border-white/10">
            <AdminLogout />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <Link href="/admin/dashboard" className="font-cute flex items-center gap-2 text-base font-bold text-primary">
            <span>🎀</span> 博客后台
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AdminLogout />
          </div>
        </div>
        <div className="mb-4 overflow-x-auto rounded-[1.25rem] border-2 border-white/70 bg-card/90 p-2 shadow-soft md:hidden dark:border-white/10">
          <AdminNav />
        </div>
        {children}
      </div>
    </div>
  );
}
