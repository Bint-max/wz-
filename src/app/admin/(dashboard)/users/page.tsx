import type { Metadata } from "next";
import { UserManager } from "@/components/admin/user-manager";

export const metadata: Metadata = { title: "用户管理" };

export default function UsersPage() {
  return <UserManager />;
}
