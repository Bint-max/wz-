import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { postController } from "@/server/posts/controller";
import { postCreateSchema } from "@/server/posts/schema";

/**
 * GET /api/posts
 * 公开列表：?page=&pageSize=&categorySlug=&tagSlug=&q=
 * 后台列表：?admin=1（需登录，包含草稿）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "1";
    const query = {
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
      categorySlug: searchParams.get("categorySlug") || undefined,
      tagSlug: searchParams.get("tagSlug") || undefined,
      q: searchParams.get("q") || undefined,
    };

    const result = isAdmin ? await postController.listAdmin(query) : await postController.list(query);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/posts —— 创建文章（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = postCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const post = await postController.create(parsed.data);
    return ok(post, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
