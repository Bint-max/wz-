"use client";

/**
 * 深色/浅色模式切换按钮
 */
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免 SSR 水合不一致
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        aria-label="切换主题"
        className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-card-foreground transition hover:bg-muted"
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label="切换深色/浅色模式"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-card-foreground transition hover:bg-muted"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
