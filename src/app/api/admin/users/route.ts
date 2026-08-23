import { ok, handleError } from "@/lib/api";
import { userController } from "@/server/users/controller";

/**
 * GET /api/admin/users —— 用户列表（需管理员）
 */
export async function GET() {
  try {
    const users = await userController.list();
    return ok(users);
  } catch (e) {
    return handleError(e);
  }
}
