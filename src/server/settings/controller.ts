/**
 * Settings 模块 Controller
 */
import { requireAdmin } from "@/lib/auth";
import { settingsService } from "./service";

export const settingsController = {
  list() {
    return settingsService.list();
  },

  async update(values: Record<string, unknown>) {
    await requireAdmin();
    return settingsService.update(values);
  },
};
