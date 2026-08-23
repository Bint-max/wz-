/**
 * Posts 模块入参校验（zod DTO）
 * 当前复用 lib/validation 中的 postSchema，后续可在此收敛专属校验。
 */
export { postSchema as postCreateSchema, postSchema as postUpdateSchema } from "@/lib/validation";

export type PostCreateInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  published?: boolean;
  featured?: boolean;
  categoryId?: string | null;
  tagIds?: string[];
  publishedAt?: string | null;
};
