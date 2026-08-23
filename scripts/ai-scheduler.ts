/**
 * 常驻定时任务：每天 08:00 执行 AI 内容生产流水线
 * 用法：pnpm scheduler
 * 适合 Docker / 云服务器长期运行（本地开发也可用）
 */
import cron from "node-cron";
import { runDailyPipeline } from "../src/lib/jobs/ai-pipeline";

const expression = process.env.AI_CRON_EXPRESSION ?? "0 8 * * *";
console.log(`[ai-scheduler] 已启动，计划表达式：${expression}`);

cron.schedule(expression, async () => {
  console.log("[ai-scheduler] 触发每日流水线...");
  try {
    await runDailyPipeline();
    console.log("[ai-scheduler] 完成");
  } catch (e) {
    console.error("[ai-scheduler] 执行失败", e);
  }
});

// 立即执行一次，便于验证
if (process.env.RUN_ON_START === "1") {
  console.log("[ai-scheduler] RUN_ON_START=1，立即执行一次");
  runDailyPipeline().catch((e) => console.error(e));
}
