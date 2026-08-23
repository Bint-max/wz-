import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tagSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/tags —— 获取标签列表
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: { where: { post: { is: { published: true } } } } } } },
    });
    return ok(tags);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/tags —— 创建标签（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const tag = await prisma.tag.create({
      data: { name: data.name, slug: slugify(data.name) },
    });
    return ok(tag, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
