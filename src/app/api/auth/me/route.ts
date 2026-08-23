import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * 获取当前登录用户
 */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ success: true, data: user });
}
