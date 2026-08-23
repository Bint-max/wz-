import { AiArticleEditor } from "@/components/admin/ai/AiArticleEditor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AiArticleEditPage({ params }: Props) {
  const { id } = await params;
  return <AiArticleEditor id={id} />;
}
