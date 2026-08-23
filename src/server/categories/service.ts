/**
 * Categories 模块 Service：业务规则、唯一性冲突、slug 生成
 */
import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { categoryRepository as repo } from "./repository";
import type { CategoryCreateInput, CategoryUpdateInput } from "./schema";

/** 将 Prisma 唯一约束冲突转换为可读的业务错误 */
function rethrowUniqueError(e: unknown): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    throw conflict("分类名称或 slug 已存在");
  }
  throw e;
}

/** 生成 slug：优先使用传入 slug，否则根据名称生成 */
function resolveSlug(name: string, slug?: string): string {
  const value = slugify(slug ?? name);
  if (!value) throw badRequest("无法从分类名称生成 slug");
  return value;
}

export const categoryService = {
  async list() {
    return repo.findManyWithCount();
  },

  async create(input: CategoryCreateInput) {
    const slug = resolveSlug(input.name, input.slug);
    try {
      return await repo.create({
        name: input.name,
        slug,
        description: input.description ?? null,
        sortOrder: input.sortOrder ?? 0,
      });
    } catch (e) {
      rethrowUniqueError(e);
    }
  },

  async update(id: string, input: CategoryUpdateInput) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("分类不存在");

    const data: {
      name?: string;
      slug?: string;
      description?: string | null;
      sortOrder?: number;
    } = {};

    if (input.name !== undefined) {
      data.name = input.name;
      // 更新名称且未显式传 slug 时，同步重算 slug
      if (input.slug === undefined) data.slug = resolveSlug(input.name);
    }
    if (input.slug !== undefined) data.slug = resolveSlug(input.name ?? existing.name, input.slug);
    if (input.description !== undefined) data.description = input.description || null;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    try {
      return await repo.update(id, data);
    } catch (e) {
      rethrowUniqueError(e);
    }
  },

  async remove(id: string) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("分类不存在");
    return repo.delete(id);
  },
};
