/**
 * AI 相关配置管理（DeepSeek + RSSHub）
 * 优先读取数据库设置（site_settings），未配置时回退环境变量。
 * DeepSeek API Key 在数据库中加密存储。
 */
import { prisma } from "@/lib/prisma";
import { encryptText, decryptText } from "@/lib/crypto";

const KEYS = {
  apiKey: "deepseek_api_key",
  model: "deepseek_model",
  baseUrl: "deepseek_base_url",
  rsshubBaseUrl: "rsshub_base_url",
  weiboCookie: "weibo_cookie",
} as const;

export type AiConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
  rsshubBaseUrl: string;
  weiboCookie: string;
};

/** 读取 AI 相关配置 */
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

  let weiboCookie = "";
  if (map[KEYS.weiboCookie]) {
    try {
      weiboCookie = decryptText(map[KEYS.weiboCookie]);
    } catch {
      weiboCookie = "";
    }
  }

  return {
    apiKey,
    model: map[KEYS.model] || process.env.DEEPSEEK_MODEL || "deepseek-chat",
    baseUrl: map[KEYS.baseUrl] || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    rsshubBaseUrl:
      map[KEYS.rsshubBaseUrl] || process.env.RSSHUB_BASE_URL || "https://rsshub.app",
    weiboCookie,
  };
}

/** 仅获取 RSSHub 地址 */
export async function getRsshubBaseUrl(): Promise<string> {
  const config = await getAiConfig();
  return config.rsshubBaseUrl;
}

/** 保存配置（apiKey 传空字符串表示保持不变；其它字段非空才更新） */
export async function saveAiConfig(data: {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  rsshubBaseUrl?: string;
  weiboCookie?: string;
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
  if (data.rsshubBaseUrl !== undefined && data.rsshubBaseUrl !== "") {
    settings.push({ key: KEYS.rsshubBaseUrl, value: data.rsshubBaseUrl });
  }
  if (data.weiboCookie !== undefined && data.weiboCookie !== "") {
    settings.push({ key: KEYS.weiboCookie, value: encryptText(data.weiboCookie) });
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
    rsshubBaseUrl: data.rsshubBaseUrl || current.rsshubBaseUrl,
    hasApiKey: Boolean(data.apiKey || current.apiKey),
    hasWeiboCookie: Boolean(data.weiboCookie || current.weiboCookie),
  };
}

/** 获取微博 Cookie（采集时自动使用） */
export async function getWeiboCookie(): Promise<string> {
  const config = await getAiConfig();
  return config.weiboCookie;
}

/** 获取脱敏后的 API Key（仅用于展示，如 sk-****abcd） */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "****";
  return `${key.slice(0, 5)}****${key.slice(-4)}`;
}
