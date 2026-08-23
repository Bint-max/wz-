import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { postSchema } from "@/lib/validation";
import { slugify, estimateReadingTime } from "@/lib/utils";
import { ok, fail, handleError } from "@/lib/api";

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  let slug = slugify(base) || "post";
  let i = 2;
  while (true) {
    const existing = await prisma.post.findFirst({
      where: { slug, NOT: { id: excludeId } },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${slugify(base) || "post"}-${i++}`;
  }
}

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/posts/:id —— 后台编辑时获取单篇文章（需登录）
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!post) return fail("文章不存在", 404);
    return ok({ ...post, tags: post.tags.map((t) => t.tag) });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * PUT /api/posts/:id —— 更新文章（需登录）
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return fail("文章不存在", 404);

    const slug = data.slug
      ? await uniqueSlug(data.slug, id)
      : data.title !== existing.title
        ? await uniqueSlug(data.title, id)
        : existing.slug;

    // 更新标签：先清空旧关联，再建立新关联
    const post = await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({ where: { postId: id } });
      return tx.post.update({
        where: { id },
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt || null,
          content: data.content,
          coverImage: data.coverImage || null,
          published: data.published,
          featured: data.featured,
          readingTime: estimateReadingTime(data.content),
          publishedAt:
            data.published && data.publishedAt
              ? new Date(data.publishedAt)
              : data.published && !existing.publishedAt
                ? new Date()
                : existing.publishedAt,
          categoryId: data.categoryId || null,
          tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        },
        include: { category: true, tags: { include: { tag: true } } },
      });
    });

    return ok(post);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * DELETE /api/posts/:id —— 删除文章（需登录）
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.post.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
