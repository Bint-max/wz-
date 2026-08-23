import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "分类管理" };
export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">分类管理</h1>
        <p className="text-sm text-muted-foreground">维护文章分类</p>
      </div>
      <CategoryManager />
    </div>
  );
}
