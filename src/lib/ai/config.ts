/**
 * DeepSeek 配置管理
 * 优先读取数据库设置（site_settings），未配置时回退环境变量。
 * API Key 在数据库中加密存储。
 */
import { prisma } from "@/lib/prisma";
import { encryptText, decryptText } from "@/lib/crypto";

const KEYS = {
  apiKey: "deepseek_api_key",
  model: "deepseek_model",
  baseUrl: "deepseek_base_url",
} as const;

export type AiConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

/** 读取 AI 配置 */
export async function getAiConfig(): Promise<AiConfig> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(KEYS) } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  let apiKey = process.env.DEEPSEEK_API_KEY ?? "";
  if (map[KEYS.apiKey]) {
    try {
      apiKey = decryptText(map[KEYS.apiKey]);
    } catch {
      apiKey = "";
    }
  }

  return {
    apiKey,
    model: map[KEYS.model] || process.env.DEEPSEEK_MODEL || "deepseek-chat",
    baseUrl: map[KEYS.baseUrl] || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  };
}

/** 保存 AI 配置（apiKey 传空字符串表示保持不变） */
export async function saveAiConfig(data: {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}) {
  const current = await getAiConfig();

  const settings: { key: string; value: string }[] = [];
  if (data.apiKey) {
    settings.push({ key: KEYS.apiKey, value: encryptText(data.apiKey) });
  }
  if (data.model !== undefined && data.model !== "") {
    settings.push({ key: KEYS.model, value: data.model });
  }
  if (data.baseUrl !== undefined && data.baseUrl !== "") {
    settings.push({ key: KEYS.baseUrl, value: data.baseUrl });
  }

  await prisma.$transaction(
    settings.map((s) =>
      prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value },
      }),
    ),
  );

  return {
    model: data.model || current.model,
    baseUrl: data.baseUrl || current.baseUrl,
    hasApiKey: Boolean(data.apiKey || current.apiKey),
  };
}

/** 获取脱敏后的 API Key（仅用于展示，如 sk-****abcd） */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "****";
  return `${key.slice(0, 5)}****${key.slice(-4)}`;
}
