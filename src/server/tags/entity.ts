/**
 * Tags 模块领域类型
 */

export type TagListItem = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
};
