/**
 * 统一业务错误类型
 * 供分层架构中的 Service/Controller 使用，最终由 handleError 转换为 HTTP 响应。
 */

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message = "请求参数错误", details?: unknown) {
  return new AppError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "未登录或权限不足") {
  return new AppError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "没有权限执行该操作") {
  return new AppError(403, "FORBIDDEN", message);
}

export function notFound(message = "资源不存在") {
  return new AppError(404, "NOT_FOUND", message);
}

export function conflict(message = "资源已存在") {
  return new AppError(409, "CONFLICT", message);
}

export function internal(message = "服务器内部错误") {
  return new AppError(500, "INTERNAL", message);
}
