import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { postSchema } from "@/lib/validation";
import { slugify, estimateReadingTime } from "@/lib/utils";
import { ok, fail, handleError } from "@/lib/api";

/**
 * 生成唯一 slug
 */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base) || "post";
  let i = 2;
  while (true) {
    const existing = await prisma.post.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${slugify(base) || "post"}-${i++}`;
  }
}

/**
 * GET /api/posts
 * 公开列表：?page=&pageSize=&categorySlug=&tagSlug=&q=
 * 后台列表：?admin=1（需登录，包含草稿）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "1";

    if (isAdmin) await requireAdmin();

    const where = {
      ...(isAdmin ? {} : { published: true }),
      ...(searchParams.get("categorySlug")
        ? { category: { slug: searchParams.get("categorySlug")! } }
        : {}),
      ...(searchParams.get("tagSlug")
        ? { tags: { some: { tag: { slug: searchParams.get("tagSlug")! } } } }
        : {}),
      ...(searchParams.get("q")
        ? {
            OR: [
              { title: { contains: searchParams.get("q")!, mode: "insensitive" as const } },
              { excerpt: { contains: searchParams.get("q")!, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: true } },
          author: { select: { name: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return ok({
      posts: posts.map((p) => ({ ...p, tags: p.tags.map((t) => t.tag) })),
      total,
      page,
      pageSize,
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/posts
 * 创建文章（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "参数错误");
    }
    const data = parsed.data;

    const slug = await uniqueSlug(data.slug ?? data.title);
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        published: data.published,
        featured: data.featured,
        readingTime: estimateReadingTime(data.content),
        publishedAt: data.published && data.publishedAt ? new Date(data.publishedAt) : data.published ? new Date() : null,
        categoryId: data.categoryId || null,
        authorId: admin.id,
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { category: true, tags: { include: { tag: true } } },
    });

    return ok(post, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
