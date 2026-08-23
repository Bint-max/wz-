# 个人博客前后端重构方案（v1.0）

> 状态：第二阶段已确认，待进入第三阶段（数据库重构）
> 日期：2026-08-23
> 原则：保留现有业务能力，先分层、再补缺、后加固，渐进式重构，不推倒重写

---

## 第一部分：现有项目分析报告

### 1. 项目概况

| 项 | 内容 |
| --- | --- |
| 项目名 | `personal-blog` |
| 定位 | 现代个人技术博客 + AI 内容生产 + 音乐播放器 |
| 版本 | Next.js 15.1.9、React 19.1.2、TypeScript 5.7、Tailwind CSS 3.4 |
| 包管理 | pnpm |
| 数据库 | PostgreSQL + Prisma 6 |
| 代码规模 | `src/` 约 9,100 行 TS/TSX/CSS |
| 当前分支 | `main_wz` |

### 2. 现状结论

当前仓库已经是一个相当完整的 Next.js 全栈项目，不是空壳博客。需求中的大部分功能已经存在：

| 目标功能 | 现状 |
| --- | --- |
| 前端重构（组件化/响应式/TS） | ✅ 已具备 |
| 后端分层架构 | ❌ 目前是 Route Handlers 扁平结构，未分层 |
| 用户系统 | ⚠️ 有 User 表、登录、JWT；缺用户管理页面/接口、注册、完整权限 |
| 博客文章系统 | ✅ 完整 |
| 音乐系统 + 全局播放器 | ✅ 已实现 |
| AI 自动文章生成 | ✅ 已实现（采集 → 生成 → 审核 → 发布） |
| 首页升级 | ✅ 已有最新/热门/分类/标签/个人介绍/播放器 |
| 后台管理系统 | ⚠️ 缺用户管理、文件管理、SEO 独立配置 |
| 安全优化 | ⚠️ 部分；缺限流、CSRF、CSP、审计日志 |
| 部署优化 | ⚠️ 有 docker-compose（仅 PostgreSQL）；缺完整 Docker 镜像与生产编排 |

### 3. 前端分析

**技术栈**：Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS 3 + `react-markdown` + `lucide-react` + `next-themes`。

**页面结构**：

- 公开：`/`、`/posts/[slug]`、`/categories[/[slug]]`、`/tags[/[slug]]`、`/search`、`/about`、`/sitemap.xml`、`/robots.txt`、`/api/rss`
- 后台：`/admin/login`、`/admin/dashboard`、`/admin/posts`、`/admin/ai-articles`、`/admin/ai-sources`、`/admin/ai-settings`、`/admin/comments`、`/admin/categories`、`/admin/music`、`/admin/settings`

**组件划分**：`layout/`、`home/`、`posts/`、`music/`、`admin/`、`ui/`，按领域划分，方向正确，但存在大组件。

**状态管理**：服务端数据由 RSC 直读 Prisma；客户端状态用 `useState/useEffect + localStorage`；后台组件内手写 `fetch`，无统一 API Client、无缓存、无统一错误处理。

**前端问题**：

1. 前后端同仓，`fetch` 散落在组件中，维护成本高
2. 无统一 API Client / 类型化请求层
3. 无 React Query/SWR，缺缓存、重试、去重
4. `music-player.tsx` 583 行、`music-manager.tsx` 445 行、`post-editor.tsx` 344 行
5. `data.ts` 中大量 `any`
6. 动效组件无 `prefers-reduced-motion` 降级
7. 加载/空/错误状态组件化不足
8. 无统一 Error Boundary
9. SEO 有基础 metadata，缺 JSON-LD 结构化数据与 OG 图片策略

### 4. 后端分析

**语言/框架**：TypeScript + Next.js Route Handlers + Prisma 6 + PostgreSQL + JWT(jose) + bcryptjs + OpenAI(DeepSeek) + rss-parser + node-cron。

**API 设计**：

- 公开：`/api/posts`、`/api/articles`、`/api/categories`、`/api/tags`、`/api/comments`、`/api/posts/[id]/comments`、`/api/music/list`、`/api/music/[id]`、`/api/music/[id]/play`、`/api/visit`、`/api/stats`、`/api/settings`、`/api/rss`、`/api/auth/*`、`/api/upload`、`/api/cron/ai-daily`
- 后台：`/api/admin/ai/articles`、`/api/admin/ai/collect|generate|settings|sources|types`、`/api/admin/articles/publish`、`/api/admin/music*`

**数据库结构（13 张表）**：`users`、`categories`、`tags`、`posts`、`post_tags`、`comments`、`site_settings`、`visit_stats`、`news_sources`、`news_items`、`ai_articles`、`ai_run_logs`、`music`。

**数据访问**：公开页复用 `data.ts`；后台 API 多在 Route Handler 内直接写 Prisma 查询，存在重复，无统一 Repository。

**权限设计**：

- `middleware.ts` 允许 `ADMIN/EDITOR` 访问 `/admin/*`
- `requireAdmin()` 只放行 `ADMIN`
- 矛盾点：`EDITOR` 能进后台页面，但几乎所有后台 API 都会拒绝 `EDITOR`

**文件存储**：本地磁盘写入 `public/uploads`，无对象存储抽象、无文件入库管理、无配额/清理。

**日志/异常**：`console.log/error`，无结构化日志、无 requestId；每个 Route Handler 手写 `try/catch`；`handleError()` 会把原始 `Error.message` 返回客户端，存在信息泄露风险。

### 5. 问题汇总

**P0 安全/正确性**

1. `EDITOR` 页面权限与 API 权限不一致
2. 无登录/API 限流
3. 错误信息直接回传客户端
4. JWT 无 issuer/audience，`JWT_SECRET` 有开发默认值
5. 文件上传校验只信扩展名/MIME，SVG 允许上传
6. Cookie 认证的写操作无 CSRF 防护

**P1 架构/可维护性**

1. Route Handler 与业务逻辑耦合，未分层
2. 数据查询重复（`/api/posts` vs `data.ts`）
3. 无统一 API Client
4. 校验/错误处理分散
5. `AiArticle.status` 用 `Int 0/1` 魔法值
6. `music.category` 是自由字符串
7. 无操作审计日志表

**P2 体验/性能/扩展**

1. 无文件管理表，上传文件无法追踪/清理
2. AI 定时任务无并发锁
3. 播放次数、访问统计接口无防刷
4. SEO 无 JSON-LD/OG image
5. 大组件拆分、动效降级

---

## 第二部分：目标架构设计

### 1. 总体形态

**Next.js 全栈单体 + 后端分层模块化（Modular Monolith）**。前端仍是 App Router，后端把业务逻辑从 Route Handler 剥离到 `src/server/*`，路由文件只做协议适配。

```
┌─────────────────────────── 前端（React 19 / Next.js 15）──────────────────────────┐
│ 页面层 src/app/**                                                                   │
│ 表现层 src/components/**                                                            │
│ 状态层 TanStack Query（服务端状态）+ Zustand（客户端状态）                           │
│ 请求层 src/client/api.ts（统一类型化 API Client + 错误归一化）                      │
└───────────────────────────────────┬────────────────────────────────────────────────┘
                                     │ JSON over HTTP（统一信封 + JWT Cookie）
┌───────────────────────────────────▼────────────────────────────────────────────────┐
│ 传输层 src/app/api/**（薄 Route Handler / Controller 适配器）                       │
├────────────────────────────────────────────────────────────────────────────────────┤
│ 应用层 src/server/**（Controller / Service / DTO Schema / Repository / Entity）     │
├────────────────────────────────────────────────────────────────────────────────────┤
│ 基础设施层：Prisma/PostgreSQL、存储抽象(Local/S3)、结构化日志、缓存/限流、通知       │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 2. 前端架构

| 层 | 技术 | 状态 |
| --- | --- | --- |
| 框架 | Next.js 15 App Router + RSC | 保留 |
| 语言 | TypeScript strict | 保留，消除 `any` |
| 样式 | Tailwind CSS 3 + CSS 变量（Kawaii） | 保留 |
| UI | 自建组件 + lucide-react | 保留，补原子组件规范 |
| 服务端状态 | `@tanstack/react-query` v5 | 新增 |
| 客户端状态 | `zustand` | 新增 |
| API Client | `src/client/api.ts` | 新增 |
| 表单校验 | zod（与后端 DTO 对齐） | 前端复用 |

**目标目录**：

```
src/
├── app/                      # 页面与路由
├── components/               # UI 组件
│   ├── ui/                   # Button/Input/Modal/Toast/Skeleton/Empty/ErrorBoundary
│   ├── layout/ home/ posts/ music/ admin/
├── client/
│   ├── api.ts
│   ├── query-client.tsx
│   ├── hooks/
│   └── stores/
├── server/
│   ├── core/                 # error/logger/auth/rate-limit/pagination
│   ├── posts/ categories/ tags/ comments/ music/ ai/ users/ media/ settings/ audit/
│   │   ├── entity.ts
│   │   ├── schema.ts
│   │   ├── repository.ts
│   │   ├── service.ts
│   │   └── controller.ts
├── lib/
└── types/
```

**组件拆分**：

- `music-player.tsx` → `MusicPlayer`、`PlaylistPanel`、`LyricPanel`、`Controls`、`ProgressBar`、`useMusicPlayer`
- `music-manager.tsx` → `MusicTable`、`MusicFormModal`、`MusicUploader`、`ReorderList`
- `post-editor.tsx` → `EditorToolbar`、`MarkdownEditor`、`Preview`、`PostMetaForm`

**统一响应信封**：

```json
{ "success": true, "data": { }, "meta": { "page": 1, "pageSize": 10, "total": 20 } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "标题不能为空", "requestId": "req_xxx" } }
```

### 3. 后端架构

**分层职责**：

| 层 | 文件 | 职责 |
| --- | --- | --- |
| Route Handler | `src/app/api/**/route.ts` | 解析参数，调 Controller，统一响应，不写业务 |
| Controller | `server/*/controller.ts` | 编排用例、鉴权、返回结果 |
| Service | `server/*/service.ts` | 业务规则、事务、领域逻辑 |
| Repository | `server/*/repository.ts` | 只封装 Prisma 查询 |
| Schema | `server/*/schema.ts` | zod DTO 入参校验 |
| Entity | `server/*/entity.ts` | 领域类型、枚举、映射函数 |

**错误处理**：

- 定义 `AppError`：`NOT_FOUND(404)`、`UNAUTHORIZED(401)`、`FORBIDDEN(403)`、`VALIDATION_ERROR(400)`、`RATE_LIMITED(429)`、`INTERNAL(500)`
- 全局 `errorHandler`：已知业务错误返回对应错误码与安全消息；未知错误只记日志，对外返回 `INTERNAL`，不泄露堆栈/Prisma 信息
- 每个请求生成 `requestId`，贯穿日志与响应

**RBAC 权限**：

| 角色 | 权限 |
| --- | --- |
| `ADMIN` | 全部权限 + 用户/系统配置 |
| `EDITOR` | 文章/AI 文章/音乐/评论审核 |
| `USER` | 预留：个人资料/评论 |

- `middleware.ts` 只做页面级快速鉴权；API 由 `server/core/auth.ts` 做权限校验
- 修复 `EDITOR` 页面权限与 API 权限不一致的问题

**日志**：引入 `pino`，记录 requestId、userId、method、path、status、耗时；后台操作写入 `audit_logs`。

**限流**：登录接口（IP+账号维度）、公开 API（IP 维度）、音乐播放次数去重、访问统计聚合；实现可插拔 `RateLimiter`，默认内存，生产接 Redis。

**文件存储抽象**：

```ts
interface StorageProvider {
  put(file, meta): Promise<{ key: string; url: string }>;
  delete(key): Promise<void>;
  getUrl(key): string;
}
```

- `LocalStorageProvider`（开发）/ `S3StorageProvider`（生产，兼容 S3/OSS/COS）
- 上传统一走 `media` 表；kind 区分 `image/audio/lyric/cover`
- 白名单 + 大小限制 + 扩展名/魔数双重校验；SVG 默认禁用或清洗

### 4. 数据库架构总览（第三阶段细化）

| 变更 | 说明 |
| --- | --- |
| `User` | 增加 `username`（唯一可选）、`status`、`lastLoginAt` |
| `Role` | 扩展为 `ADMIN/EDITOR/USER` |
| `AiArticle.status` | `Int 0/1` → enum `AiArticleStatus { DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED }` |
| `Music.category` | 保留字符串场景标签，新增可选 `categoryId` 关联，兼容旧数据 |
| 新增 `media` | 文件元信息、上传者、存储驱动、引用关系 |
| 新增 `audit_logs` | 操作人、动作、对象、结果、IP、requestId、时间 |
| 新增 `seo_meta`（可选） | 站点级/实体级 SEO 覆盖配置 |
| 新增 `permissions`（可选） | 细粒度权限扩展 |

**迁移策略**：使用 Prisma `migrate dev` 生成迁移；脚本幂等；开发期可先 `db push`，正式环境用 migration。

### 5. 安全架构

| 层 | 措施 |
| --- | --- |
| 认证 | JWT + httpOnly Cookie；强制 `JWT_SECRET`；设置 issuer/audience；支持过期刷新 |
| 授权 | RBAC 权限守卫，页面与 API 双重校验 |
| 传输 | HTTPS；`SameSite=Lax`；敏感操作加 CSRF Token/Origin 校验 |
| 注入 | Prisma 参数化查询；Markdown 不启用 `rehype-raw`；外链 URL 白名单 |
| 上传 | 白名单 + 大小限制 + 魔数校验 + 随机文件名 + 对象存储隔离 |
| 接口 | 登录/公开 API 限流 |
| 日志 | 审计日志 + 结构化日志，敏感字段脱敏 |

### 6. 部署架构

```
┌──────────────┐
│ Nginx/Caddy │  HTTPS / 静态资源缓存 / 反向代理
└──────┬───────┘
       │
┌──────▼────────┐      ┌──────────────────┐
│ Next.js 应用  │◄────►│ PostgreSQL       │
│ (Docker)      │      │ (数据卷/备份)    │
└──────┬────────┘      └──────────────────┘
       │
┌──────▼────────┐      ┌──────────────────┐
│ 可选 RSSHub   │      │ 对象存储 S3/OSS  │
│ (自建)        │      └──────────────────┘
└───────────────┘
```

- 新增 `Dockerfile`（多阶段构建）
- 完善 `docker-compose.yml`：`app + postgres + rsshub(可选)`
- `.env.example` 补齐 `STORAGE_DRIVER`、限流、日志级别、CSRF、对象存储等
- 初始化脚本：`scripts/init-db.sh`（迁移 + 种子 + 校验）
- 生产流程文档：构建镜像 → 迁移 → 启动 → 健康检查 → 日志/备份

### 7. 分阶段落地映射

| 阶段 | 交付内容 | 是否改代码 |
| --- | --- | --- |
| 第二阶段 | 架构设计文档 | 否 |
| 第三阶段 | 数据库 schema 重构 + 迁移 + 索引 | 是 |
| 第四阶段 | 后端分层 + 前端数据层（先选 1 个模块试点） | 是 |
| 第五阶段 | 功能补缺（用户管理、文件管理、SEO 配置、AI 审核增强） | 是 |
| 第六阶段 | 安全加固 + 部署优化 | 是 |

---

## 第三部分：待确认决策

1. 总体形态：继续用 Next.js 全栈单体 + 后端模块化分层（推荐）
2. 前端状态方案：`TanStack Query + Zustand`
3. 后端分层落地顺序：先选一个模块试点，再推广
4. 数据库迁移：允许修改 `prisma/schema.prisma` 并生成 migration（保留 `db push` 兼容开发）

---

## 实施记录（持续更新）

### 2026-08-23

**第三阶段：数据库重构（已完成）**

- `prisma/schema.prisma` 增加枚举与 `media`、`audit_logs`、`seo_meta` 等表
- `AiArticle.status` 由 `Int(0/1)` 改为 `AiArticleStatus` 枚举
- 生成基线迁移 `prisma/migrations/20260823020000_refactor_db/migration.sql`
- 新增存量数据迁移脚本 `scripts/migrate-ai-status.sql`
- 提交：`4f237aa`、`5eabd1b`

**第四阶段：后端分层 + 前端数据层（进行中，单模块试点）**

- 新增 `src/lib/errors.ts` 统一业务错误，`src/lib/api.ts` 识别 `AppError`
- 完成 `categories` 模块试点：
  - 后端：`src/server/categories/{entity,schema,repository,service,controller}.ts`
  - 路由：`src/app/api/categories/route.ts`、`src/app/api/categories/[id]/route.ts` 改为薄适配层
  - 前端：`src/client/api.ts`、`src/client/hooks/useCategories.ts`
  - 组件：`src/components/admin/category-manager.tsx` 使用新数据层

> 待办：确认试点规范后，将分层模式推广到 posts/tags/comments/music/ai 等模块；网络可用后接入 TanStack Query 与 Zustand。

**持续补充（同一日）**

- 推广分层模块：`tags`、`settings`、`users`、`media`、`seo`
- 新增前端 hooks：`useTags`、`useSettings`、`useUsers`、`useMedia`、`useSeo`
- 新增后台页面：用户管理 `/admin/users`、文件管理 `/admin/media`、SEO 配置 `/admin/seo`
- 文件上传路由开始写入 `media` 表元信息
- 安全基础能力：内存限流器（登录防爆破）、审计日志写入 `audit_logs`
- 部署：新增 `Dockerfile`、应用级 `docker-compose.yml`、`scripts/init-db.sh`，环境变量补充 `STORAGE_DRIVER`

> 待办：继续将 posts/comments/music/ai 模块迁移到分层结构；网络可用后接入 TanStack Query、Zustand、对象存储与分布式限流。

**再补充（同一日）**

- 完成 `posts`、`comments`、`music` 模块分层迁移，对应 API 路由改为薄适配层
- 后端分层模块现已覆盖：categories / tags / settings / posts / comments / music / users / media / seo

> 仍待迁移：AI 相关模块（articles/sources/settings/jobs）可继续沿用现有 `lib/ai` 与 `lib/jobs`，后续按同一规范逐步收拢。
