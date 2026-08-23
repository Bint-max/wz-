# 个人技术博客

一个现代化个人技术博客，用于记录学习笔记、工作经验、项目总结与文章分享。

采用 **Next.js 15 + TypeScript + Tailwind CSS + Prisma + PostgreSQL** 构建，界面为卡哇伊治愈系风格，支持响应式布局与深色/浅色主题，并内置 **AI 内容生产模块**（新闻采集 → AI 写作 → 审核发布）。

## ✨ 功能特性

- **首页**：个人头像、简介、最新文章、热门文章、技术标签、访问统计
- **文章系统**：Markdown 编辑、实时预览、代码高亮、分类/标签、搜索、阅读量统计
- **后台管理**：管理员登录、发布/编辑/删除文章、图片上传、数据看板
- **评论系统**：评论提交、审核、删除、基础反垃圾
- **个人信息页**：介绍、技术技能、工作经历、项目经历、联系方式
- **AI 内容生产**：RSS/API 新闻采集、**按新闻类型筛选**、去重、AI 原创文章生成、审核发布、每日定时任务、**后台直接配置 DeepSeek**
- **额外功能**：深色/浅色切换、SEO、RSS、站点地图、图片懒加载、加载动画、GitHub 链接、响应式布局

## 🎀 卡哇伊主题（Kawaii）

全站采用马卡龙配色（粉 / 浅紫 / 奶白 / 浅蓝 / 薄荷绿）与软萌圆角设计，主要交互组件：

- `src/components/ui/BubbleCursor.tsx`：鼠标泡泡轨迹 + 圆形光标拖尾 + 点击星星爆炸（自动禁用触屏/减少动态效果场景）
- `src/components/home/FloatingDecor.tsx`：页面漂浮装饰（星星、云朵、爱心、花朵、小动物）
- `src/components/home/CuteCard.tsx`：手账/日记本风格文章卡片
- `src/components/ui/CuteButton.tsx`：点击弹跳的动画按钮

标题使用 Google Fonts 的「ZCOOL KuaiLe」可爱手写体，正文保留系统圆润字体以保证技术文章可读性。

> 注意：`next/font/google` 会在 `pnpm build` 时联网下载字体。若本地构建环境无法联网，可改用 `src/app/layout.tsx` 中注释掉的系统字体方案（或预先配置好网络代理）。

## 🧰 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 19、Next.js 15（App Router）、TypeScript、Tailwind CSS 3 |
| 后端 | Next.js Route Handlers（API Routes）、JWT 认证（jose） |
| 数据 | PostgreSQL、Prisma ORM |
| 内容 | react-markdown、remark-gfm、rehype-highlight |
| AI | DeepSeek（OpenAI 兼容接口） |
| 采集/定时 | rss-parser、node-cron |
| 部署 | Vercel 或 云服务器（Linux / Docker） |

## 📁 目录结构

```
personal-blog/
├── prisma/
│   ├── schema.prisma        # 数据库模型（含 AI 模块）
│   └── seed.ts              # 种子数据脚本
├── public/
│   ├── images/avatar.png    # 默认头像
│   └── uploads/             # 后台上传图片
├── scripts/
│   ├── setup.sh             # 本地一键初始化脚本
│   ├── ai-daily.ts          # AI 每日流水线（单次执行）
│   └── ai-scheduler.ts      # AI 每日流水线（node-cron 常驻）
├── src/
│   ├── app/
│   │   ├── (public 页面)     # 首页/文章/分类/标签/搜索/关于
│   │   ├── admin/           # 后台管理系统（含 ai-articles、ai-sources）
│   │   ├── api/             # 后端 API（含 AI 模块接口）
│   │   ├── sitemap.ts       # 站点地图
│   │   └── robots.ts        # 爬虫规则
│   ├── components/          # 组件化 UI
│   ├── lib/                 # 工具、认证、数据访问、AI 模块
│   └── types/               # 类型定义
├── .env.example             # 环境变量示例
├── docker-compose.yml       # 本地 PostgreSQL
└── next.config.ts
```

## 🤖 AI 内容生产模块

### 工作流程

```
配置新闻来源（RSS/API）
      ↓ 定时 / 手动采集
新闻去重入库（NewsItem）
      ↓ AI 生成
AI 草稿（AiArticle，status=0）
      ↓ 管理员审核编辑
发布到博客（Post，status=1）
```

### 后台入口

- AI 文章审核：`/admin/ai-articles`
- 新闻来源配置：`/admin/ai-sources`

### RSSHub 热门渠道（方案 A）

系统支持**一键添加热门渠道**（微博热搜 / 知乎热榜 / 央视新闻），数据源来自 RSSHub：

```bash
# 1. 自建 RSSHub（推荐，稳定且免费）
docker run -d --name rsshub -p 1200:1200 diygod/rsshub

# 2. 在 .env 配置自建地址（不配置则用公共实例 rsshub.app，可能限流）
RSSHUB_BASE_URL="http://你的服务器IP:1200"
```

然后到后台「AI 设置」填入 RSSHub 地址（或使用默认公共实例），再到「新闻来源」页点「一键添加热门渠道」即可，无需手动填 URL。

> 💡 关于「自动从微博 / 央视 / 知乎获取新闻」的完整可行性分析，请阅读 [docs/ai-news-feasibility.md](./docs/ai-news-feasibility.md)。

### DeepSeek 配置

DeepSeek 的 API Key、模型与接口地址可在后台 **「AI 设置」**（`/admin/ai-settings`）直接配置：
- API Key 加密存储在数据库，不会明文暴露；
- 数据库未配置时回退读取 `.env` 中的 `DEEPSEEK_API_KEY` 等变量；
- 无需手动修改服务器文件即可切换模型（`deepseek-chat` / `deepseek-reasoner`）。

### 新闻类型

> 💡 关于「自动从微博 / 央视 / 知乎获取新闻」的可行方案，请阅读 [docs/ai-news-feasibility.md](./docs/ai-news-feasibility.md)（RSSHub + DeepSeek 组合方案）。

在「新闻来源」中可为每个来源指定**新闻类型**（如 科技 / 财经 / 体育 / 生活）。
- 采集时新闻条目会自动继承来源类型；
- 在 `/admin/ai-articles` 的采集/生成面板中可按类型筛选，只采集或生成指定类型的新闻。

### 手动操作

在 `/admin/ai-articles` 页面：
1. （可选）选择新闻类型后点击「立即采集新闻」拉取对应来源的最新新闻
2. 输入数量后点击「生成文章」按类型批量生成 AI 草稿
3. 在列表中编辑、预览、修改标题/分类/标签
4. 点击「发布」将文章同步到博客前台

### 每日自动运行

```bash
# 方式一：node-cron 常驻进程（默认每天 08:00）
pnpm scheduler

# 方式二：Linux crontab（每天 08:00 单次执行）
0 8 * * * cd /path/to/personal-blog && /usr/bin/pnpm ai:daily >> /var/log/ai-daily.log 2>&1
```

### 主要接口

| 接口 | 说明 |
| --- | --- |
| `GET /api/articles` | 获取文章列表 |
| `GET /api/articles/{id}` | 获取文章详情 |
| `POST /api/admin/articles/publish` | 发布 AI 文章 |
| `GET /api/admin/ai/articles` | AI 文章列表 |
| `GET/PUT/DELETE /api/admin/ai/articles/{id}` | AI 文章详情/编辑/删除 |
| `GET/POST /api/admin/ai/sources` | 新闻来源列表/新增 |
| `PUT/DELETE /api/admin/ai/sources/{id}` | 来源编辑/删除 |
| `POST /api/admin/ai/collect` | 手动采集新闻（body 支持 `sourceId`、`type`） |
| `POST /api/admin/ai/generate` | 手动 AI 生成（body 支持 `newsId`、`limit`、`type`） |
| `GET /api/admin/ai/types` | 获取已有新闻类型列表 |
| `GET /api/admin/ai/settings` | 获取 DeepSeek 配置（脱敏） |
| `POST /api/admin/ai/settings` | 保存 DeepSeek 配置（API Key 加密存储） |
| `GET/POST /api/cron/ai-daily` | 定时入口（需 `CRON_SECRET`） |

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

# 3. 准备环境变量（含 DEEPSEEK_API_KEY）
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
| `NEXT_PUBLIC_SITE_URL` | 站点地址（用于 SEO/RSS/站点地图） | `https://your-blog.example.com` |
| `NEXT_PUBLIC_ALLOW_REGISTER` | 是否允许公开注册（当前版本保留字段） | `false` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥（不写死在代码；也可在后台「AI 设置」配置） | `sk-...` |
| `DEEPSEEK_MODEL` | AI 模型 | `deepseek-chat` |
| `DEEPSEEK_BASE_URL` | DeepSeek API 地址 | `https://api.deepseek.com` |
| `CRON_SECRET` | 定时接口鉴权密钥 | 任意长随机字符串 |
| `NOTIFY_WEBHOOK_URL` | 管理员通知 Webhook（可选） | 飞书/钉钉/企业微信机器人地址 |
| `AI_DAILY_LIMIT` | 每日自动生成文章数量 | `3` |
| `RSSHUB_BASE_URL` | RSSHub 地址（可选，默认公共实例；也可在后台「AI 设置」配置） | `http://your-ip:1200` |

## ☁️ 部署

### Vercel

1. 将代码推送到 GitHub 仓库。
2. 在 Vercel 导入该仓库，框架自动识别为 Next.js。
3. 准备一个云端 PostgreSQL（推荐 [Neon](https://neon.tech)、[Supabase](https://supabase.com) 或 Railway），复制连接串。
4. 在 Vercel 项目 **Settings → Environment Variables** 中配置全部环境变量（含 AI 相关）。
5. 部署。Vercel 安装依赖时会自动执行 `prisma generate`（已在 `postinstall` 中配置）。
6. 首次部署后，手动执行一次迁移与种子：

```bash
pnpm db:push && pnpm db:seed
```

> Vercel 上定时任务可用 Vercel Cron 触发 `/api/cron/ai-daily`（需携带 `CRON_SECRET`）。

### 云服务器（Linux / Docker）

1. 安装 Node.js、pnpm、PostgreSQL。
2. 拉取代码，配置 `.env`，执行 `pnpm install && pnpm db:push && pnpm db:seed`。
3. 构建并启动：`pnpm build && pnpm start`（建议用 pm2 守护）。
4. 定时任务使用 `pnpm scheduler`（node-cron）或系统 crontab 调用 `pnpm ai:daily`。
5. 可选 Nginx 反向代理 + certbot 配置 HTTPS。

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
| `pnpm ai:daily` | 执行一次 AI 每日流水线 |
| `pnpm scheduler` | 启动 AI 每日定时任务（node-cron） |

## 📝 说明

- 公开页面的数据查询做了「数据库不可用时的优雅降级」，因此即使数据库未启动，`pnpm build` 与公开页面也能正常渲染（内容为空）。后台 API 与后台页面不受此影响，会正常抛出错误。
- 本项目使用 Next.js 15.1.9（已修复 CVE-2025-66478）与 React 19.1.2。
- 关于 404：由于全局 `loading.tsx` 启用了流式渲染，`notFound()` 页面按 Next.js 官方设计返回 `200` 并附带 `noindex` 元标签，不会影响 SEO。
- AI 生成接口需要 `DEEPSEEK_API_KEY`；未配置时接口会返回明确错误，不会影响博客其它功能。

## 📄 License

MIT
