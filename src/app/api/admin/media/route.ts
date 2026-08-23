import { ok, handleError } from "@/lib/api";
import { mediaController } from "@/server/media/controller";

/**
 * GET /api/admin/media —— 文件列表（需管理员）
 */
export async function GET() {
  try {
    const media = await mediaController.list();
    return ok(media);
  } catch (e) {
    return handleError(e);
  }
}
