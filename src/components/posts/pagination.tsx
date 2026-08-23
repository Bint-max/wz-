/**
 * 分页组件
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
          "flex h-9 w-9 items-center justify-center rounded-full border transition",
          page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border text-sm transition",
            p === page
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={makeHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition",
          page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-muted",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
