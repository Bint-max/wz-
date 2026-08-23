-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AiArticleStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'SPAM', 'REJECTED');

-- CreateEnum
CREATE TYPE "NewsSourceType" AS ENUM ('RSS', 'API');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "MusicStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'AUDIO', 'LYRIC', 'COVER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "ip" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "visit_stats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "visit_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NewsSourceType" NOT NULL DEFAULT 'RSS',
    "url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "newsType" TEXT,
    "defaultCategoryId" TEXT,
    "defaultTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "config" JSONB,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_items" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "newsType" TEXT,
    "publishedAt" TIMESTAMP(3),
    "hotScore" DOUBLE PRECISION,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_articles" (
    "id" TEXT NOT NULL,
    "newsItemId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedCategoryId" TEXT,
    "status" "AiArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceUrl" TEXT,
    "model" TEXT,
    "tokenUsage" INTEGER,
    "cost" DOUBLE PRECISION,
    "error" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "postId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_run_logs" (
    "id" TEXT NOT NULL,
    "runType" TEXT NOT NULL,
    "status" "AiRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_run_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "cover" TEXT,
    "url" TEXT NOT NULL,
    "lyric" TEXT,
    "category" TEXT,
    "categoryId" TEXT,
    "isRecommend" BOOLEAN NOT NULL DEFAULT false,
    "isHomeBgm" BOOLEAN NOT NULL DEFAULT false,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" "MusicStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "driver" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT,
    "url" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "hash" TEXT,
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "result" TEXT,
    "ip" TEXT,
    "requestId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_meta" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL DEFAULT '',
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ogImage" TEXT,
    "canonical" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_published_publishedAt_idx" ON "posts"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "posts_categoryId_idx" ON "posts"("categoryId");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "comments_postId_idx" ON "comments"("postId");

-- CreateIndex
CREATE INDEX "comments_status_idx" ON "comments"("status");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "visit_stats_date_key" ON "visit_stats"("date");

-- CreateIndex
CREATE INDEX "news_sources_enabled_idx" ON "news_sources"("enabled");

-- CreateIndex
CREATE INDEX "news_sources_newsType_idx" ON "news_sources"("newsType");

-- CreateIndex
CREATE UNIQUE INDEX "news_items_urlHash_key" ON "news_items"("urlHash");

-- CreateIndex
CREATE INDEX "news_items_sourceId_idx" ON "news_items"("sourceId");

-- CreateIndex
CREATE INDEX "news_items_newsType_idx" ON "news_items"("newsType");

-- CreateIndex
CREATE INDEX "news_items_publishedAt_idx" ON "news_items"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_articles_newsItemId_key" ON "ai_articles"("newsItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_articles_slug_key" ON "ai_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ai_articles_postId_key" ON "ai_articles"("postId");

-- CreateIndex
CREATE INDEX "ai_articles_status_idx" ON "ai_articles"("status");

-- CreateIndex
CREATE INDEX "ai_articles_createdAt_idx" ON "ai_articles"("createdAt");

-- CreateIndex
CREATE INDEX "ai_run_logs_runType_createdAt_idx" ON "ai_run_logs"("runType", "createdAt");

-- CreateIndex
CREATE INDEX "music_status_sort_idx" ON "music"("status", "sort");

-- CreateIndex
CREATE INDEX "music_category_idx" ON "music"("category");

-- CreateIndex
CREATE INDEX "music_categoryId_idx" ON "music"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "media_storageKey_key" ON "media"("storageKey");

-- CreateIndex
CREATE INDEX "media_kind_createdAt_idx" ON "media"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "media_uploaderId_idx" ON "media"("uploaderId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "seo_meta_entityType_idx" ON "seo_meta"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "seo_meta_entityType_entityId_key" ON "seo_meta"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "news_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_articles" ADD CONSTRAINT "ai_articles_newsItemId_fkey" FOREIGN KEY ("newsItemId") REFERENCES "news_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_articles" ADD CONSTRAINT "ai_articles_suggestedCategoryId_fkey" FOREIGN KEY ("suggestedCategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_articles" ADD CONSTRAINT "ai_articles_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music" ADD CONSTRAINT "music_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

