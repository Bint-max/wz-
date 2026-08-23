/**
 * Categories 模块入参校验（zod DTO）
 */
import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "分类名称不能为空").max(50),
  slug: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
