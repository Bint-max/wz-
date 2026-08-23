import { PipelinePanel } from "@/components/admin/ai/PipelinePanel";
import { AiArticleTable } from "@/components/admin/ai/AiArticleTable";

export const metadata = { title: "AI 文章" };
export const dynamic = "force-dynamic";

export default function AiArticlesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cute text-2xl font-bold">AI 文章</h1>
        <p className="text-sm text-muted-foreground">采集热点、AI 生成、审核后发布</p>
      </div>
      <PipelinePanel />
      <AiArticleTable />
    </div>
  );
}
