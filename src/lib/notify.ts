/**
 * 管理员通知
 * 支持通用 Webhook（飞书 / 钉钉 / 企业微信均可通过机器人 Webhook 接入）
 */
export async function notifyAdmin(message: string) {
  const webhook = process.env.NOTIFY_WEBHOOK_URL;
  if (!webhook) {
    console.log(`[AI 通知] ${message}`);
    return;
  }

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msg_type: "text",
        content: { text: message },
        text: message,
      }),
    });
  } catch (e) {
    console.error("[AI 通知失败]", e);
  }
}
