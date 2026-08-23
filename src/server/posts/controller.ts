/**
 * Posts 模块 Controller
 */
import { requireAdmin } from "@/lib/auth";
import { postService } from "./service";
import type { PostCreateInput } from "./schema";

export const postController = {
  list(query: Parameters<typeof postService.list>[0]) {
    return postService.list(query);
  },

  async listAdmin(query: Parameters<typeof postService.list>[0]) {
    await requireAdmin();
    return postService.list({ ...query, admin: true });
  },

  async getById(id: string) {
    await requireAdmin();
    return postService.getById(id);
  },

  async create(input: PostCreateInput) {
    const actor = await requireAdmin();
    return postService.create(input, actor.id);
  },

  async update(id: string, input: PostCreateInput) {
    await requireAdmin();
    return postService.update(id, input);
  },

  async remove(id: string) {
    await requireAdmin();
    return postService.remove(id);
  },
};
