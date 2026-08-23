-- =============================================================
-- 存量数据库升级脚本：ai_articles.status 0/1 -> AiArticleStatus
-- =============================================================
-- 适用场景：
--   旧版数据库的 ai_articles.status 为 Int(0=草稿, 1=已发布)，
--   且尚未通过 Prisma 把该列改为枚举类型。
--
-- 执行方式：
--   psql "$DATABASE_URL" -f scripts/migrate-ai-status.sql
--
-- 说明：
--   本脚本只负责把旧 0/1 数据安全映射到新枚举，并创建枚举类型。
--   其余表结构变更（新增 media/audit_logs/seo_meta、用户字段等）
--   可继续用 `pnpm db:push` 或 Prisma migrate 完成。
-- =============================================================

BEGIN;

-- 1. 创建新的 AiArticleStatus 枚举（若已存在则跳过）
DO $$
BEGIN
  CREATE TYPE "AiArticleStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. 移除旧整数默认值（旧 schema 为 status Int @default(0)）
ALTER TABLE "ai_articles" ALTER COLUMN "status" DROP DEFAULT;

-- 3. 将旧 0/1 映射为新枚举
--    1 -> PUBLISHED，其余（0 或异常值）-> DRAFT
ALTER TABLE "ai_articles"
  ALTER COLUMN "status" TYPE "AiArticleStatus"
  USING (
    CASE
      WHEN "status" = 1 THEN 'PUBLISHED'::"AiArticleStatus"
      ELSE 'DRAFT'::"AiArticleStatus"
    END
  );

-- 4. 恢复新默认值
ALTER TABLE "ai_articles"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"AiArticleStatus";

COMMIT;
