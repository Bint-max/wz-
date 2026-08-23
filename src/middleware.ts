import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "blog_auth_token";
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-only-secret-change-me");

/**
 * 后台路由鉴权中间件
 * 除 /admin/login 外，所有 /admin/* 都需要有效登录态
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let valid = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      valid = payload?.role === "ADMIN" || payload?.role === "EDITOR";
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
