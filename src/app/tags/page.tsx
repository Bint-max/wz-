import Link from "next/link";
import { getTags } from "@/lib/data";

export const revalidate = 60;

export const metadata = { title: "技术标签" };

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="page-enter mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-cute text-3xl font-bold">技术标签</h1>
      <p className="mt-2 text-sm text-muted-foreground">所有文章标签</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="rounded-full border bg-card px-4 py-2 text-sm transition hover:bg-primary hover:text-primary-foreground"
          >
            {tag.name} <span className="ml-1 opacity-60">{tag._count.posts}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
