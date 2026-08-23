import { SourceManager } from "@/components/admin/ai/SourceManager";

export const metadata = { title: "新闻来源" };
export const dynamic = "force-dynamic";

export default function AiSourcesPage() {
  const rsshubBaseUrl = process.env.RSSHUB_BASE_URL || "https://rsshub.app";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cute text-2xl font-bold">新闻来源</h1>
        <p className="text-sm text-muted-foreground">配置 RSS / API 新闻来源，或一键添加 RSSHub 热门渠道</p>
      </div>
      <SourceManager rsshubBaseUrl={rsshubBaseUrl} />
    </div>
  );
}
