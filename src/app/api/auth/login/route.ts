import { NextResponse, type NextRequest } from "next/server";
import { verifyCredentials, signToken, COOKIE_NAME } from "@/lib/auth";

/**
 * 管理员登录
 * POST /api/auth/login { email, password }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "请输入邮箱和密码" }, { status: 400 });
    }

    const user = await verifyCredentials(String(email), String(password));
    if (!user) {
      return NextResponse.json({ success: false, error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signToken(user);
    const res = NextResponse.json({ success: true, data: user });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "登录失败" }, { status: 500 });
  }
}
