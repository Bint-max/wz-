/**
 * API 路由通用工具
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AppError } from "./errors";

/** 成功响应 */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

/** 错误响应 */
export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** 捕获常见异常并返回统一错误 */
export function handleError(e: unknown) {
  if (e instanceof AppError) {
    return fail(e.message, e.status);
  }
  if (e instanceof Error && e.message === "UNAUTHORIZED") {
    return fail("未登录或权限不足", 401);
  }
  console.error("[API Error]", e);
  return fail(e instanceof Error ? e.message : "服务器内部错误", 500);
}

/** 从请求中获取客户端 IP（用于反垃圾评论） */
export function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
