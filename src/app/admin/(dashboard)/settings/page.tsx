import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "站点设置" };
export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cute text-2xl font-bold">站点设置</h1>
        <p className="text-sm text-muted-foreground">配置站点基本信息与 SEO</p>
      </div>
      <SettingsForm />
    </div>
  );
}
