import { NextRequest, NextResponse } from "next/server";
import { runDailyPipeline } from "@/lib/jobs/ai-pipeline";

/**
 * GET/POST /api/cron/ai-daily —— 每日定时流水线入口
 * 安全要求：必须携带 CRON_SECRET（header 或 query）
 */
async function checkSecret(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-cron-secret");
  const query = new URL(req.url).searchParams.get("secret");
  return header === secret || query === secret;
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}

async function run(req: NextRequest) {
  if (!(await checkSecret(req))) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }
  try {
    const result = await runDailyPipeline();
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "运行失败" },
      { status: 500 },
    );
  }
}
