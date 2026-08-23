/**
 * Music 模块 Controller
 */
import { requireAdmin } from "@/lib/auth";
import { musicService } from "./service";
import type { MusicCreateInput } from "./schema";

export const musicController = {
  listPublic(query: Parameters<typeof musicService.listPublic>[0]) {
    return musicService.listPublic(query);
  },

  getPublic(id: string) {
    return musicService.getPublic(id);
  },

  play(id: string) {
    return musicService.play(id);
  },

  async adminList() {
    await requireAdmin();
    return musicService.adminList();
  },

  async create(input: MusicCreateInput) {
    await requireAdmin();
    return musicService.create(input);
  },

  async update(id: string, input: MusicCreateInput) {
    await requireAdmin();
    return musicService.update(id, input);
  },

  async remove(id: string) {
    await requireAdmin();
    return musicService.remove(id);
  },

  async reorder(ids: string[]) {
    await requireAdmin();
    return musicService.reorder(ids);
  },
};
