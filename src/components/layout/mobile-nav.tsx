"use client";

/**
 * 移动端抽屉导航
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页" },
  { href: "/categories/tech", label: "分类" },
  { href: "/tags/next-js", label: "标签" },
  { href: "/search", label: "搜索" },
  { href: "/about", label: "关于" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        aria-label="打开菜单"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-card-foreground"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-64 bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">导航</span>
              <button aria-label="关闭菜单" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition",
                    pathname === link.href
                      ? "bg-muted font-medium"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
