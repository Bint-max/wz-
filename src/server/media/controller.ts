/**
 * Media 模块 Controller
 */
import { requireAdmin } from "@/lib/auth";
import { mediaService } from "./service";

export const mediaController = {
  async list() {
    await requireAdmin();
    return mediaService.list();
  },

  async remove(id: string) {
    await requireAdmin();
    return mediaService.remove(id);
  },
};
