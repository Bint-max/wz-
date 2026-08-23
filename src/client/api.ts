/**
 * 统一前端 API Client
 * - 统一解析 { success, data, error } 响应信封
 * - 非 2xx 或 success=false 时抛出 ApiError
 * - 后续可在此基础上接入 TanStack Query
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.success) {
    const message = payload?.error ?? `请求失败（HTTP ${res.status}）`;
    throw new ApiError(message, res.status);
  }

  return payload.data as T;
}

export const apiClient = {
  get<T>(url: string, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "GET" });
  },
  post<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "POST", body });
  },
  put<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "PUT", body });
  },
  patch<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "PATCH", body });
  },
  delete<T>(url: string, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "DELETE" });
  },
};
