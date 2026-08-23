"use client";

/**
 * 后台整体布局壳
 */
import Link from "next/link";
import { AdminNav, AdminLogout } from "./admin-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-4 py-6">
      <aside className="hidden w-52 shrink-0 md:block">
        <div className="sticky top-6 rounded-2xl border bg-card p-3">
          <Link
            href="/admin/dashboard"
            className="mb-3 block px-3 py-2 text-sm font-bold text-primary"
          >
            博客后台
          </Link>
          <AdminNav />
          <div className="mt-3 border-t pt-3">
            <AdminLogout />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <Link href="/admin/dashboard" className="text-sm font-bold text-primary">
            博客后台
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AdminLogout />
          </div>
        </div>
        <div className="mb-4 overflow-x-auto rounded-2xl border bg-card p-2 md:hidden">
          <AdminNav />
        </div>
        {children}
      </div>
    </div>
  );
}
