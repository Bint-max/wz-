import { AiSettings } from "@/components/admin/ai/AiSettings";

export const metadata = { title: "AI 设置" };
export const dynamic = "force-dynamic";

export default function AiSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cute text-2xl font-bold">AI 设置</h1>
        <p className="text-sm text-muted-foreground">DeepSeek / RSSHub / 微博 Cookie 分开保存，互不影响</p>
      </div>
      <AiSettings />
    </div>
  );
}
