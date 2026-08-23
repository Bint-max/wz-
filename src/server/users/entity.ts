/**
 * Users 模块领域类型
 */

export type UserListItem = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: "ADMIN" | "EDITOR" | "USER";
  status: "ACTIVE" | "DISABLED";
  createdAt: Date;
  lastLoginAt: Date | null;
  _count: { posts: number };
};
