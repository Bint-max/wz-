/**
 * 分页组件（卡哇伊版）
 */
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => `${basePath}${basePath.includes("?") ? "&" : "?"}page=${p}`;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={makeHref(page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 border-pink-100 bg-card/90 text-pink-400 shadow-soft transition hover:bg-pink-50",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm transition",
            p === page
              ? "border-transparent bg-gradient-to-br from-pink-400 to-violet-400 font-bold text-white shadow-soft"
              : "border-pink-100 bg-card/90 text-muted-foreground hover:bg-pink-50",
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={makeHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 border-pink-100 bg-card/90 text-pink-400 shadow-soft transition hover:bg-pink-50",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
