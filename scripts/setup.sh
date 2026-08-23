#!/usr/bin/env bash
# 本地一键初始化脚本
# 用法：bash scripts/setup.sh
set -euo pipefail

echo "==> 1/4 启动 PostgreSQL（Docker）"
if ! command -v docker >/dev/null 2>&1; then
  echo "未检测到 Docker，请先安装 Docker 或自行启动 PostgreSQL 后重试。"
  exit 1
fi
docker compose up -d postgres

echo "==> 2/4 准备环境变量"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "已从 .env.example 生成 .env，请按需修改配置。"
fi

echo "==> 3/4 安装依赖"
pnpm install

echo "==> 4/4 初始化数据库并写入种子数据"
pnpm db:push
pnpm db:seed

echo "✅ 初始化完成！运行 pnpm dev 启动开发服务器。"
echo "   后台地址：http://localhost:3000/admin/login"
echo "   默认账号：admin@example.com / admin123"
