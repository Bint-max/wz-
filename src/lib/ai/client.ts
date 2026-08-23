/**
 * AI 客户端封装（DeepSeek）
 * DeepSeek 提供 OpenAI 兼容接口，故复用 OpenAI SDK。
 * API Key 从环境变量读取，绝不在代码中写死。
 */
import OpenAI from "openai";

export function getAiClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置，请在 .env 中设置");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

export function getAiModel() {
  return process.env.DEEPSEEK_MODEL || "deepseek-chat";
}
