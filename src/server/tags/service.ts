/**
 * Tags 模块 Service：slug 生成与唯一性冲突处理
 */
import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { tagRepository as repo } from "./repository";
import type { TagCreateInput, TagUpdateInput } from "./schema";

function rethrowUniqueError(e: unknown): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    throw conflict("标签名称或 slug 已存在");
  }
  throw e;
}

function resolveSlug(name: string): string {
  const value = slugify(name);
  if (!value) throw badRequest("无法从标签名称生成 slug");
  return value;
}

export const tagService = {
  async list() {
    return repo.findManyWithCount();
  },

  async create(input: TagCreateInput) {
    try {
      return await repo.create({ name: input.name, slug: resolveSlug(input.name) });
    } catch (e) {
      rethrowUniqueError(e);
    }
  },

  async update(id: string, input: TagUpdateInput) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("标签不存在");

    const data: { name?: string; slug?: string } = {};
    if (input.name !== undefined) {
      data.name = input.name;
      data.slug = resolveSlug(input.name);
    }

    try {
      return await repo.update(id, data);
    } catch (e) {
      rethrowUniqueError(e);
    }
  },

  async remove(id: string) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("标签不存在");
    return repo.delete(id);
  },
};
