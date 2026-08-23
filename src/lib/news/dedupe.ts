/**
 * 新闻去重工具
 */
import { createHash } from "crypto";

/** 归一化 URL：去空格、统一小写、去掉末尾斜杠与常见追踪参数 */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    const ignore = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "spm", "from"];
    for (const key of ignore) u.searchParams.delete(key);
    return u.toString().toLowerCase().replace(/\/$/, "");
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, "");
  }
}

/** 生成去重哈希 */
export function hashUrl(url: string): string {
  return createHash("sha256").update(normalizeUrl(url)).digest("hex").slice(0, 24);
}
