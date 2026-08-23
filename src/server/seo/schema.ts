/**
 * SEO 模块入参校验（zod DTO）
 */
import { z } from "zod";

const urlField = z
  .string()
  .url("请输入合法 URL")
  .optional()
  .nullable()
  .or(z.literal(""));

export const seoSiteUpdateSchema = z.object({
  title: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(300).optional().nullable(),
  keywords: z.array(z.string().trim().max(30)).max(20).optional(),
  ogImage: urlField,
  canonical: urlField,
});

export type SeoSiteUpdateInput = z.infer<typeof seoSiteUpdateSchema>;
