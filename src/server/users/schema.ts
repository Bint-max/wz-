/**
 * Users 模块入参校验（zod DTO）
 */
import { z } from "zod";

export const userUpdateSchema = z.object({
  username: z.string().trim().min(1).max(50).nullable().optional(),
  name: z.string().trim().min(1, "用户名不能为空").max(50).optional(),
  bio: z.string().trim().max(300).nullable().optional(),
  role: z.enum(["ADMIN", "EDITOR", "USER"]).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
