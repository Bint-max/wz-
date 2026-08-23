/**
 * SEO 模块领域类型
 */

export type SeoMetaItem = {
  id: string;
  entityType: string;
  entityId: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  ogImage: string | null;
  canonical: string | null;
  updatedAt: Date;
};
