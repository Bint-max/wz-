import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/articles/{id} —— 获取文章详情
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: { select: { name: true } },
      },
    });
    if (!post || !post.published) return fail("文章不存在", 404);
    return ok({ ...post, tags: post.tags.map((t) => t.tag) });
  } catch (e) {
    return handleError(e);
  }
}
