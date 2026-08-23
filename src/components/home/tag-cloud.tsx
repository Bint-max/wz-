/**
 * 技术标签云
 */
import Link from "next/link";
import type { TagItem } from "@/types";

export function TagCloud({ tags }: { tags: TagItem[] }) {
  if (!tags.length) return null;
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold">技术标签</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            {tag.name}
            <span className="ml-1 opacity-60">{tag._count.posts}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
