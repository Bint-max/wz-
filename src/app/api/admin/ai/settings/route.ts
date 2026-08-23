import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAiConfig, saveAiConfig, maskApiKey } from "@/lib/ai/config";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/admin/ai/settings —— 获取 DeepSeek 配置（脱敏）
 */
export async function GET() {
  try {
    await requireAdmin();
    const config = await getAiConfig();
    return ok({
      model: config.model,
      baseUrl: config.baseUrl,
      apiKeyMasked: maskApiKey(config.apiKey),
      hasApiKey: Boolean(config.apiKey),
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/admin/ai/settings —— 保存 DeepSeek 配置
 * body: { apiKey?, model?, baseUrl? }（apiKey 为空表示保持不变）
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : undefined;
    const model = typeof body?.model === "string" ? body.model.trim() : undefined;
    const baseUrl = typeof body?.baseUrl === "string" ? body.baseUrl.trim() : undefined;

    if (apiKey === undefined && model === undefined && baseUrl === undefined) {
      return fail("没有可保存的内容");
    }

    const result = await saveAiConfig({ apiKey, model, baseUrl });
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
