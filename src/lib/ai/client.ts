/**
 * AI 客户端封装（DeepSeek）
 * DeepSeek 提供 OpenAI 兼容接口，故复用 OpenAI SDK。
 * 配置优先读取数据库（可在后台「AI 设置」维护），未配置时回退环境变量。
 */
import OpenAI from "openai";
import { getAiConfig } from "./config";

export async function getAiClient() {
  const config = await getAiConfig();
  if (!config.apiKey) {
    throw new Error("DeepSeek API Key 未配置，请在后台「AI 设置」或 .env 中设置");
  }
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });
}

export async function getAiModel() {
  const config = await getAiConfig();
  return config.model;
}
