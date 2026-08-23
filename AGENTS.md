# AGENTS.md — 项目协作约定

本文件为 AI 助手（Codex）在参与本项目时的强制工作约定。

## 项目简介

Next.js 15 + TypeScript + Tailwind CSS + Prisma + PostgreSQL 的个人技术博客，
内置卡哇伊主题与 AI 内容生产模块（DeepSeek 生成、RSS 采集、定时任务）。

## 工作流约定

1. **任何代码/配置改动完成后，必须同步更新 `README.md`**
   - 功能变更 → 更新「功能特性」
   - 依赖/技术变更 → 更新「技术栈」与「常用脚本」
   - 环境变量变更 → 更新「环境变量」表格
   - 目录/页面变更 → 更新「目录结构」与相关章节
   - 部署方式变更 → 更新「部署」章节

2. **每次改动完成后必须提交并推送到 Git**
   - 提交信息使用 Conventional Commits：`feat:` / `fix:` / `docs:` / `chore:` / `refactor:`
   - 提交前检查 `git status`，不要提交 `.env`、`node_modules/`、`.next/` 等被忽略文件
   - 提交后执行 `git push` 推送到远程（当前分支 `main_wz`，远程 `origin`）

3. **环境变量**
   - API Key 一律通过环境变量配置，禁止写死在代码中
   - 当前 AI 服务为 DeepSeek：`DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` / `DEEPSEEK_BASE_URL`

4. **测试**
   - 改动后至少运行 `pnpm tsc --noEmit`（或 `pnpm build`）确认无类型/构建错误
