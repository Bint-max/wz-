import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/data";

/**
 * POST /api/visit —— 记录一次站点访问
 */
export async function POST() {
  await recordVisit();
  return NextResponse.json({ success: true });
}
