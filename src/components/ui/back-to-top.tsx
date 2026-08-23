"use client";

/**
 * 回到顶部按钮（滚动到一定距离后显示）
 */
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      aria-label="回到顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-violet-400 text-white shadow-soft transition hover:scale-110"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
