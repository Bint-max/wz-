#!/usr/bin/env bash
set -euo pipefail

# 数据库初始化：应用迁移并写入种子数据
echo "==> 应用数据库迁移"
pnpm prisma migrate deploy

echo "==> 写入种子数据"
pnpm db:seed

echo "==> 数据库初始化完成"
