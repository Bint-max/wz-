import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAiConfig, saveAiConfig, maskApiKey } from "@/lib/ai/config";
import { ok, fail, handleError } from "@/lib/api";

/**
 * GET /api/admin/ai/settings —— 获取 AI 配置（脱敏）
 */
export async function GET() {
  try {
    await requireAdmin();
    const config = await getAiConfig();
    return ok({
      model: config.model,
      baseUrl: config.baseUrl,
      rsshubBaseUrl: config.rsshubBaseUrl,
      apiKeyMasked: maskApiKey(config.apiKey),
      hasApiKey: Boolean(config.apiKey),
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/admin/ai/settings —— 保存 AI 配置
 * body: { apiKey?, model?, baseUrl?, rsshubBaseUrl? }
 * （字段为空表示保持不变）
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : undefined;
    const model = typeof body?.model === "string" ? body.model.trim() : undefined;
    const baseUrl = typeof body?.baseUrl === "string" ? body.baseUrl.trim() : undefined;
    const rsshubBaseUrl =
      typeof body?.rsshubBaseUrl === "string" ? body.rsshubBaseUrl.trim() : undefined;

    if (
      apiKey === undefined &&
      model === undefined &&
      baseUrl === undefined &&
      rsshubBaseUrl === undefined
    ) {
      return fail("没有可保存的内容");
    }

    const result = await saveAiConfig({ apiKey, model, baseUrl, rsshubBaseUrl });
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
