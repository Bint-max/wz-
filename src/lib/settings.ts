/**
 * 站点设置读取
 * 使用 React cache 避免单次请求内重复查询
 */
import { cache } from "react";
import { prisma } from "./prisma";

export type SiteSettings = {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  avatar: string;
  github: string;
  email: string;
  bio: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "技术随笔",
  siteTitle: "技术随笔 | 记录学习、工作与思考",
  siteDescription: "一名全栈工程师的个人博客，分享技术、项目经验与学习笔记。",
  avatar: "/images/avatar.png",
  github: "https://github.com/yourname",
  email: "admin@example.com",
  bio: "热爱开源与分享的全栈工程师。",
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      siteName: map.site_name ?? DEFAULT_SETTINGS.siteName,
      siteTitle: map.site_title ?? DEFAULT_SETTINGS.siteTitle,
      siteDescription: map.site_description ?? DEFAULT_SETTINGS.siteDescription,
      avatar: map.avatar ?? DEFAULT_SETTINGS.avatar,
      github: map.github ?? DEFAULT_SETTINGS.github,
      email: map.email ?? DEFAULT_SETTINGS.email,
      bio: map.bio ?? DEFAULT_SETTINGS.bio,
    };
  } catch {
    // 数据库不可用时返回默认值，保证页面仍可渲染
    return DEFAULT_SETTINGS;
  }
});
