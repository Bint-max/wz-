import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/settings —— 获取站点设置（公开）
 */
export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany();
    return ok(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/settings —— 批量更新站点设置（需登录）
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return fail("参数错误");
    }

    await prisma.$transaction(
      Object.entries(body).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value ?? "") },
          create: { key, value: String(value ?? "") },
        }),
      ),
    );

    return ok({ updated: Object.keys(body).length });
  } catch (e) {
    return handleError(e);
  }
}
