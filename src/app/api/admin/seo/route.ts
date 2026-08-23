import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { seoController } from "@/server/seo/controller";
import { seoSiteUpdateSchema } from "@/server/seo/schema";

/**
 * GET /api/admin/seo —— SEO 配置（需管理员）
 */
export async function GET() {
  try {
    const data = await seoController.get();
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * PUT /api/admin/seo —— 更新站点级 SEO 配置（需管理员）
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = seoSiteUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "参数错误");

    const site = await seoController.updateSite(parsed.data);
    return ok(site);
  } catch (e) {
    return handleError(e);
  }
}
