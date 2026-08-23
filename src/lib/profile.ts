/**
 * 个人主页静态资料
 * 可直接在此文件修改个人信息，页面会随之更新
 */
export const profile = {
  introduction:
    "你好，我是一名热爱技术分享的全栈工程师。专注于 Web 应用开发、系统架构设计与工程效率提升，喜欢把踩过的坑和学到的东西记录下来，也希望通过写作与更多人交流。",
  skills: [
    { name: "前端开发", level: 90, tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
    { name: "后端开发", level: 85, tags: ["Node.js", "NestJS", "PostgreSQL", "Redis"] },
    { name: "工程化", level: 80, tags: ["CI/CD", "Docker", "Vercel", "Monorepo"] },
    { name: "性能优化", level: 78, tags: ["Web Vitals", "SSR/SSG", "缓存策略", "可观测性"] },
  ],
  experiences: [
    {
      company: "某互联网公司",
      role: "高级全栈工程师",
      period: "2022 - 至今",
      description: "负责核心业务系统的架构设计与开发，推动前端性能与工程效率提升。",
    },
    {
      company: "某创业公司",
      role: "前端工程师",
      period: "2020 - 2022",
      description: "从 0 到 1 搭建多个 Web 产品，参与需求、设计与交付全流程。",
    },
  ],
  projects: [
    {
      name: "个人博客系统",
      description: "基于 Next.js + Prisma + PostgreSQL 的现代博客，支持后台管理、评论与 SEO。",
      link: "/",
      stack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
    },
    {
      name: "内部中台系统",
      description: "面向运营团队的数据可视化与配置平台，支撑千万级数据查询。",
      link: "#",
      stack: ["React", "Node.js", "PostgreSQL"],
    },
  ],
};
