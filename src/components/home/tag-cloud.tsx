/**
 * 技术标签云（卡哇伊小贴纸）
 */
import Link from "next/link";
import type { TagItem } from "@/types";

export function TagCloud({ tags }: { tags: TagItem[] }) {
  if (!tags.length) return null;
  return (
    <section className="rounded-[1.5rem] border-2 border-white/70 dark:border-white/10 bg-card/90 p-5 shadow-soft">
      <h2 className="font-cute mb-3 text-base font-semibold">✦ 技术标签</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="cute-chip px-3 py-1 text-xs font-medium"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {tag.name}
            <span className="ml-1 opacity-60">×{tag._count.posts}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
