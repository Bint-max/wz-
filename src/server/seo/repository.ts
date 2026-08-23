/**
 * SEO 模块 Repository
 */
import { prisma } from "@/lib/prisma";

const SITE_KEY = { entityType: "site", entityId: "" };

export const seoRepository = {
  findSite() {
    return prisma.seoMeta.findUnique({ where: { entityType_entityId: SITE_KEY } });
  },

  findMany() {
    return prisma.seoMeta.findMany({ orderBy: [{ entityType: "asc" }, { entityId: "asc" }] });
  },

  upsertSite(data: {
    title?: string | null;
    description?: string | null;
    keywords?: string[];
    ogImage?: string | null;
    canonical?: string | null;
  }) {
    return prisma.seoMeta.upsert({
      where: { entityType_entityId: SITE_KEY },
      update: data,
      create: { ...SITE_KEY, ...data },
    });
  },

  delete(id: string) {
    return prisma.seoMeta.delete({ where: { id } });
  },
};
