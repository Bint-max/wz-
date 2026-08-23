/**
 * Users 模块 Service：用户管理业务规则
 */
import { forbidden, notFound } from "@/lib/errors";
import { userRepository as repo } from "./repository";
import type { UserUpdateInput } from "./schema";

export const userService = {
  async list() {
    return repo.findMany();
  },

  async update(id: string, input: UserUpdateInput, actorId: string) {
    if (id === actorId && input.status === "DISABLED") {
      throw forbidden("不能禁用当前登录账号");
    }
    if (id === actorId && input.role && input.role !== "ADMIN") {
      throw forbidden("不能降低当前登录账号的角色");
    }

    const existing = await repo.findById(id);
    if (!existing) throw notFound("用户不存在");

    return repo.update(id, input);
  },

  async remove(id: string, actorId: string) {
    if (id === actorId) throw forbidden("不能删除当前登录账号");
    const existing = await repo.findById(id);
    if (!existing) throw notFound("用户不存在");
    return repo.delete(id);
  },
};
