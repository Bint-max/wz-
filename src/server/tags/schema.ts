/**
 * Tags 模块入参校验（zod DTO）
 */
import { z } from "zod";

export const tagCreateSchema = z.object({
  name: z.string().trim().min(1, "标签名称不能为空").max(50),
});

export const tagUpdateSchema = tagCreateSchema.partial();

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
