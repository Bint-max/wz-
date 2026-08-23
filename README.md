# 个人技术博客

一个现代化个人技术博客，用于记录学习笔记、工作经验、项目总结与文章分享。

采用 **Next.js 15 + TypeScript + Tailwind CSS + Prisma + PostgreSQL** 构建，界面简洁现代（类 Medium / Vercel / Notion 风格），支持响应式布局与深色/浅色主题。

## ✨ 功能特性

- **首页**：个人头像、简介、最新文章、热门文章、技术标签、访问统计
- **文章系统**：Markdown 编辑、实时预览、代码高亮、分类/标签、搜索、阅读量统计
- **后台管理**：管理员登录、发布/编辑/删除文章、图片上传、数据看板
- **评论系统**：评论提交、审核、删除、基础反垃圾
- **个人信息页**：介绍、技术技能、工作经历、项目经历、联系方式
- **额外功能**：深色/浅色切换、SEO、RSS、站点地图、图片懒加载、加载动画、GitHub 链接、响应式布局

## 🧰 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 19、Next.js 15（App Router）、TypeScript、Tailwind CSS 3 |
| 后端 | Next.js Route Handlers（API Routes）、JWT 认证（jose） |
| 数据 | PostgreSQL、Prisma ORM |
| 内容 | react-markdown、remark-gfm、rehype-highlight |
| 部署 | Vercel + 任意 PostgreSQL（Neon / Supabase / Railway） |

## 📁 目录结构

```
personal-blog/
├── prisma/
│   ├── schema.prisma        # 数据库模型
│   └── seed.ts              # 种子数据脚本
├── public/
│   ├── images/avatar.png    # 默认头像
│   └── uploads/             # 后台上传图片
├── scripts/
│   └── setup.sh             # 本地一键初始化脚本
├── src/
│   ├── app/
│   │   ├── (public 页面)     # 首页/文章/分类/标签/搜索/关于
│   │   ├── admin/           # 后台管理系统
│   │   ├── api/             # 后端 API
│   │   ├── sitemap.ts       # 站点地图
│   │   └── robots.ts        # 爬虫规则
│   ├── components/          # 组件化 UI
│   ├── lib/                 # 工具、认证、数据访问层
│   └── types/               # 类型定义
├── .env.example             # 环境变量示例
├── docker-compose.yml       # 本地 PostgreSQL
└── next.config.ts
```

## 🚀 本地运行

### 前置要求

- Node.js >= 20（建议 22+）
- pnpm >= 9
- Docker（用于本地 PostgreSQL；也可自行准备 PostgreSQL）

### 步骤

```bash
# 1. 进入项目目录
cd personal-blog

# 2. 安装依赖
pnpm install

# 3. 准备环境变量
cp .env.example .env

# 4. 启动 PostgreSQL 并初始化数据库（含种子数据）
pnpm db:push
pnpm db:seed
# 或直接运行一键脚本：bash scripts/setup.sh

# 5. 启动开发服务器
pnpm dev
```

打开 http://localhost:3000 即可访问。

### 后台登录

- 地址：http://localhost:3000/admin/login
- 默认账号：`admin@example.com`
- 默认密码：`admin123`

> 首次登录后请修改种子脚本中的密码并重新执行 `pnpm db:seed`，或在数据库中手动更新密码哈希。

## 🗄️ 数据库初始化

本地使用 Docker 启动 PostgreSQL：

```bash
docker compose up -d
```

数据表由 Prisma schema 定义，常用命令：

```bash
pnpm db:push      # 同步 schema 到数据库（开发期快速建表）
pnpm db:migrate   # 生成并应用迁移
pnpm db:seed      # 写入种子数据（管理员、分类、标签、示例文章）
pnpm db:studio    # 打开 Prisma Studio 图形界面
pnpm db:reset     # 重置数据库并重新执行种子
```

## ⚙️ 环境变量

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://postgres:postgres@localhost:5432/personal_blog?schema=public` |
| `JWT_SECRET` | 登录 Token 签名密钥（生产必须更换） | 任意长随机字符串 |
| `NEXT_PUBLIC_SITE_URL` | 站点地址（用于 SEO/RSS/站点地图） | `https://your-blog.vercel.app` |
| `NEXT_PUBLIC_ALLOW_REGISTER` | 是否允许公开注册（当前版本保留字段） | `false` |

## ☁️ 部署到 Vercel

1. 将代码推送到 GitHub 仓库。
2. 在 Vercel 导入该仓库，框架自动识别为 Next.js。
3. 准备一个云端 PostgreSQL（推荐 [Neon](https://neon.tech)、[Supabase](https://supabase.com) 或 Railway），复制连接串。
4. 在 Vercel 项目 **Settings → Environment Variables** 中配置：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
5. 部署。Vercel 安装依赖时会自动执行 `prisma generate`（已在 `postinstall` 中配置）。
6. 首次部署后，手动执行一次迁移与种子（本地或通过 CI）：

```bash
pnpm db:push && pnpm db:seed
```

> 生产环境建议使用 `prisma migrate deploy` 管理迁移，并将 `NEXT_PUBLIC_SITE_URL` 设为正式域名。

### 关于图片上传

本地开发时，后台上传的图片会写入 `public/uploads` 目录。Vercel 的 Serverless 文件系统是只读且临时的，**请勿直接依赖本地磁盘存储图片**。生产环境建议将图片上传改为对象存储（如 S3 / Cloudinary / 阿里云 OSS），只需改造 `src/app/api/upload/route.ts` 即可。

## 📜 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 代码检查 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:push` | 同步数据库结构 |
| `pnpm db:seed` | 写入种子数据 |
| `pnpm db:studio` | 打开数据库图形界面 |

## 📝 说明

- 公开页面的数据查询做了「数据库不可用时的优雅降级」，因此即使数据库未启动，`pnpm build` 与公开页面也能正常渲染（内容为空）。后台 API 与后台页面不受此影响，会正常抛出错误。
- 本项目使用 Next.js 15.1.9（已修复 CVE-2025-66478）与 React 19.1.2。
- 关于 404：由于全局 `loading.tsx` 启用了流式渲染，`notFound()` 页面按 Next.js 官方设计返回 `200` 并附带 `noindex` 元标签，不会影响 SEO。

## 📄 License

MIT
