import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/categories —— 获取分类列表（含文章数）
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { posts: { where: { published: true } } } } },
    });
    return ok(categories);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/categories —— 创建分类（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");
    const data = parsed.data;

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug ? slugify(data.slug) : slugify(data.name),
        description: data.description || null,
        sortOrder: data.sortOrder,
      },
    });
    return ok(category, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
