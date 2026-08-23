import { CommentManager } from "@/components/admin/comment-manager";

export const metadata = { title: "评论审核" };
export const dynamic = "force-dynamic";

export default function AdminCommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">评论审核</h1>
        <p className="text-sm text-muted-foreground">审核、删除与拦截垃圾评论</p>
      </div>
      <CommentManager />
    </div>
  );
}
