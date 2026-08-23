/**
 * Tags 模块 Controller：编排用例与鉴权
 */
import { requireAdmin } from "@/lib/auth";
import { tagService } from "./service";
import type { TagCreateInput, TagUpdateInput } from "./schema";

export const tagController = {
  list() {
    return tagService.list();
  },

  async create(input: TagCreateInput) {
    await requireAdmin();
    return tagService.create(input);
  },

  async update(id: string, input: TagUpdateInput) {
    await requireAdmin();
    return tagService.update(id, input);
  },

  async remove(id: string) {
    await requireAdmin();
    return tagService.remove(id);
  },
};
