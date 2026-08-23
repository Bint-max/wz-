/**
 * Users 模块 Controller：用户管理鉴权与编排
 */
import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { userService } from "./service";
import type { UserUpdateInput } from "./schema";

export const userController = {
  async list() {
    await requireAdmin();
    return userService.list();
  },

  async update(id: string, input: UserUpdateInput) {
    const actor = await requireAdmin();
    const result = await userService.update(id, input, actor.id);
    await writeAudit({
      actorId: actor.id,
      actorName: actor.name,
      action: "user.update",
      targetType: "user",
      targetId: id,
      result: "SUCCESS",
      meta: { patch: input },
    });
    return result;
  },

  async remove(id: string) {
    const actor = await requireAdmin();
    const result = await userService.remove(id, actor.id);
    await writeAudit({
      actorId: actor.id,
      actorName: actor.name,
      action: "user.delete",
      targetType: "user",
      targetId: id,
      result: "SUCCESS",
    });
    return result;
  },
};
