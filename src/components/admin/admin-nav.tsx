"use client";

/**
 * 后台侧边导航（卡哇伊版）
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FolderOpen,
  Settings,
  LogOut,
  Bot,
  Rss,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "数据看板", icon: LayoutDashboard },
  { href: "/admin/posts", label: "文章管理", icon: FileText },
  { href: "/admin/ai-articles", label: "AI 文章", icon: Bot },
  { href: "/admin/ai-sources", label: "新闻来源", icon: Rss },
  { href: "/admin/comments", label: "评论审核", icon: MessageSquare },
  { href: "/admin/categories", label: "分类管理", icon: FolderOpen },
  { href: "/admin/settings", label: "站点设置", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-2">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition",
              active
                ? "bg-gradient-to-r from-pink-400 to-violet-400 font-medium text-white shadow-soft"
                : "text-muted-foreground hover:bg-pink-50",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLogout() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
      className="flex w-full shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-pink-50 hover:text-pink-500"
    >
      <LogOut className="h-4 w-4" />
      退出登录
    </button>
  );
}
