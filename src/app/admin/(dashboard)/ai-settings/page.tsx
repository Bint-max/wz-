import { DeepSeekSettings } from "@/components/admin/ai/DeepSeekSettings";

export const metadata = { title: "AI 设置" };
export const dynamic = "force-dynamic";

export default function AiSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cute text-2xl font-bold">AI 设置</h1>
        <p className="text-sm text-muted-foreground">在后台维护 DeepSeek 配置，无需手动修改 .env</p>
      </div>
      <DeepSeekSettings />
    </div>
  );
}
