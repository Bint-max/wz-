"use client";

/**
 * 搜索框（卡哇伊版）
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchForm({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-300" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜搜看... ✧"
        className="w-full rounded-full border-2 border-pink-100 bg-card/90 py-2.5 pl-10 pr-4 text-sm shadow-soft outline-none transition focus:border-pink-300 dark:border-pink-500/20"
      />
    </form>
  );
}
