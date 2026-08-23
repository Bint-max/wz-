/**
 * 数据库种子脚本
 * 运行：pnpm db:seed
 * 用途：初始化管理员账号、默认分类、示例标签、示例文章与站点设置
 */
import { PrismaClient, CommentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始初始化数据库...");

  // 1. 创建默认管理员
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "博主",
      passwordHash,
      bio: "一名热爱分享的全栈工程师，专注 Web 开发、系统架构与技术沉淀。",
    },
  });
  console.log("✅ 管理员账号：admin@example.com / admin123");

  // 2. 创建默认分类
  const categorySeed = [
    { name: "技术分享", slug: "tech", description: "前端、后端、数据库与工程化实践", sortOrder: 1 },
    { name: "工作总结", slug: "work-summary", description: "阶段性复盘与职场思考", sortOrder: 2 },
    { name: "学习笔记", slug: "study-notes", description: "读书、课程与源码阅读笔记", sortOrder: 3 },
    { name: "项目经验", slug: "project", description: "真实项目踩坑与落地经验", sortOrder: 4 },
    { name: "随笔", slug: "essay", description: "生活与思考的零散记录", sortOrder: 5 },
  ];
  const categories = new Map<string, string>();
  for (const c of categorySeed) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories.set(c.slug, row.id);
  }
  console.log(`✅ 已创建 ${categorySeed.length} 个分类`);

  // 3. 创建示例标签
  const tagSeed = ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS", "Node.js", "性能优化"];
  const tagIds = new Map<string, string>();
  for (const name of tagSeed) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const row = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    tagIds.set(name, row.id);
  }
  console.log(`✅ 已创建 ${tagSeed.length} 个标签`);

  // 4. 创建示例文章
  const posts = [
    {
      title: "用 Next.js 15 搭建现代个人博客",
      slug: "build-blog-with-nextjs-15",
      excerpt: "从零开始，使用 Next.js App Router、TypeScript 与 Tailwind CSS 搭建一个具备后台管理、评论与 SEO 的现代个人博客。",
      coverImage: null,
      categoryId: categories.get("tech")!,
      featured: true,
      published: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      content: `# 用 Next.js 15 搭建现代个人博客

这篇文章记录我如何从零搭建一个现代化个人博客，覆盖前端、后端与数据层。

## 技术选型

- **框架**：Next.js 15（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **数据层**：Prisma + PostgreSQL

## 为什么选择 Next.js

Next.js 提供文件路由、服务端组件、API Routes、图片优化等能力，非常适合博客这种内容型网站。

\`\`\`tsx
export default async function Page() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
\`\`\`

## 小结

好的架构让内容创作更专注，性能与 SEO 则交给框架处理。
`,
    },
    {
      title: "Prisma 与 PostgreSQL 实战笔记",
      slug: "prisma-postgresql-notes",
      excerpt: "总结 Prisma ORM 的常用建模技巧、迁移流程，以及多对多关系与索引设计的实践经验。",
      coverImage: null,
      categoryId: categories.get("study-notes")!,
      featured: true,
      published: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      tags: ["Prisma", "PostgreSQL"],
      content: `# Prisma 与 PostgreSQL 实战笔记

## 数据建模

使用 \`schema.prisma\` 定义数据模型，通过多对多关系连接文章与标签。

\`\`\`prisma
model Post {
  id    String   @id @default(cuid())
  tags  PostTag[]
}

model Tag {
  id    String   @id @default(cuid())
  posts PostTag[]
}
\`\`\`

## 迁移

\`\`\`bash
pnpm prisma migrate dev --name init
pnpm prisma generate
\`\`\`
`,
    },
    {
      title: "Tailwind CSS 深色模式实践",
      slug: "tailwind-dark-mode",
      excerpt: "使用 CSS 变量 + class 策略，在博客中优雅实现深色/浅色主题切换。",
      coverImage: null,
      categoryId: categories.get("tech")!,
      featured: false,
      published: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      tags: ["Tailwind CSS", "React"],
      content: `# Tailwind CSS 深色模式实践

## 设计令牌

用 HSL 变量定义颜色，通过 \`dark\` class 切换主题。

\`\`\`css
:root {
  --background: 0 0% 100%;
}

.dark {
  --background: 0 0% 7%;
}
\`\`\`

## 组件切换

配合 \`next-themes\` 实现主题持久化。
`,
    },
    {
      title: "2025 年度工作总结与复盘",
      slug: "2025-work-summary",
      excerpt: "回顾这一年的项目交付、技术成长与团队协作，梳理值得沉淀的经验。",
      coverImage: null,
      categoryId: categories.get("work-summary")!,
      featured: false,
      published: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      tags: ["性能优化"],
      content: `# 2025 年度工作总结与复盘

## 关键成果

1. 完成多个核心项目的上线与稳定运行
2. 建立团队代码评审与 CI 规范
3. 推动前端性能优化，首屏耗时下降约 40%

## 反思与改进

持续复盘才能持续成长。
`,
    },
  ];

  for (const p of posts) {
    const existing = await prisma.post.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    await prisma.post.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        featured: p.featured,
        published: p.published,
        publishedAt: p.publishedAt,
        readingTime: Math.max(1, Math.ceil(p.content.length / 500)),
        categoryId: p.categoryId,
        authorId: admin.id,
        tags: {
          create: p.tags.map((t) => ({ tagId: tagIds.get(t)! })),
        },
      },
    });
  }
  console.log(`✅ 已创建 ${posts.length} 篇示例文章`);

  // 5. 创建示例评论
  const firstPost = await prisma.post.findUnique({ where: { slug: "build-blog-with-nextjs-15" } });
  if (firstPost) {
    await prisma.comment.createMany({
      data: [
        {
          postId: firstPost.id,
          authorName: "访客小明",
          content: "写得很清楚，照着搭建一遍就成功了，感谢分享！",
          status: CommentStatus.APPROVED,
        },
        {
          postId: firstPost.id,
          authorName: "访客小红",
          content: "期待后续的部署与优化文章。",
          status: CommentStatus.PENDING,
        },
      ],
    });
    console.log("✅ 已创建示例评论");
  }

  // 6. 创建站点设置
  const settings = {
    site_name: "技术随笔",
    site_title: "技术随笔 | 记录学习、工作与思考",
    site_description: "一名全栈工程师的个人博客，分享技术、项目经验与学习笔记。",
    avatar: "/images/avatar.png",
    github: "https://github.com/yourname",
    email: "admin@example.com",
    bio: "热爱开源与分享的全栈工程师。",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("✅ 已初始化站点设置");

  console.log("🎉 数据库初始化完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
