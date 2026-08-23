import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "管理员登录" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
