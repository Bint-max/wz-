import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validation";
import { ok, fail, handleError, getIp } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/** 简易反垃圾规则：链接过多或命中敏感词则判为 SPAM */
function isSpam(content: string): boolean {
  const links = content.match(/https?:\/\//g)?.length ?? 0;
  const spamWords = ["赌博", "彩票", "代开发票", "办证", "sex", "casino"];
  if (links > 3) return true;
  if (spamWords.some((w) => content.toLowerCase().includes(w.toLowerCase()))) return true;
  return false;
}

/**
 * GET /api/posts/:id/comments —— 获取已审核评论
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const comments = await prisma.comment.findMany({
      where: { postId: id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    return ok(comments);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/posts/:id/comments —— 提交评论（进入待审核）
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) return fail("文章不存在", 404);

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorName: data.authorName,
        authorEmail: data.authorEmail || null,
        content: data.content,
        ip: getIp(req),
        status: isSpam(data.content) ? "SPAM" : "PENDING",
      },
    });

    return ok(comment, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
