/**
 * Comments 模块入参校验（zod DTO）
 */
import { z } from "zod";
import { CommentStatus } from "@prisma/client";

export { commentSchema as commentCreateSchema } from "@/lib/validation";

export const commentStatusSchema = z.object({
  status: z.nativeEnum(CommentStatus),
});

export type CommentStatusInput = z.infer<typeof commentStatusSchema>;
