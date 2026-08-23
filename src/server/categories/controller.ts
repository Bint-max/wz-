/**
 * Categories 模块 Controller：编排用例与鉴权，供 Route Handler 调用
 */
import { requireAdmin } from "@/lib/auth";
import { categoryService } from "./service";
import type { CategoryCreateInput, CategoryUpdateInput } from "./schema";

export const categoryController = {
  list() {
    return categoryService.list();
  },

  async create(input: CategoryCreateInput) {
    await requireAdmin();
    return categoryService.create(input);
  },

  async update(id: string, input: CategoryUpdateInput) {
    await requireAdmin();
    return categoryService.update(id, input);
  },

  async remove(id: string) {
    await requireAdmin();
    return categoryService.remove(id);
  },
};
