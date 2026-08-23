/**
 * Categories 模块领域类型
 */

export type CategoryEntity = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
};

export type CategoryListItem = CategoryEntity & {
  _count: { posts: number };
};
