/**
 * SEO 模块 Controller
 */
import { requireAdmin } from "@/lib/auth";
import { seoService } from "./service";
import type { SeoSiteUpdateInput } from "./schema";

export const seoController = {
  async get() {
    await requireAdmin();
    return seoService.get();
  },

  async updateSite(input: SeoSiteUpdateInput) {
    await requireAdmin();
    return seoService.updateSite(input);
  },

  async remove(id: string) {
    await requireAdmin();
    return seoService.remove(id);
  },
};
