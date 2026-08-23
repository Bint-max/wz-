/**
 * 通用工具函数
 */

/** 拼接 className，过滤空值 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** 将字符串转换为 URL 友好的 slug */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 根据内容长度估算阅读时长（分钟） */
export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 400));
}

/** 格式化日期为「2026 年 8 月 23 日」 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/** 格式化日期为短格式 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

/** 数字千分位格式化 */
export function formatNumber(n: number): string {
  return n.toLocaleString("zh-CN");
}

/** 为 URL 补充协议：省略 http/https 时自动补全 https:// */
export function ensureUrlScheme(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
