/**
 * 单次执行 AI 每日流水线
 * 用法：pnpm ai:daily
 * 适合 Linux crontab / systemd timer 定时调用
 */
import { runDailyPipeline } from "../src/lib/jobs/ai-pipeline";

async function main() {
  console.log("[ai-daily] 开始执行 AI 内容生产流水线...");
  try {
    const result = await runDailyPipeline();
    console.log("[ai-daily] 完成", JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (e) {
    console.error("[ai-daily] 执行失败", e);
    process.exit(1);
  }
}

main();
