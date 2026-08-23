/**
 * SEO 模块 Service
 */
import { notFound } from "@/lib/errors";
import { seoRepository as repo } from "./repository";
import type { SeoSiteUpdateInput } from "./schema";

export const seoService = {
  async get() {
    const [site, items] = await Promise.all([repo.findSite(), repo.findMany()]);
    return {
      site: site ?? {
        entityType: "site",
        entityId: "",
        title: null,
        description: null,
        keywords: [],
        ogImage: null,
        canonical: null,
      },
      items,
    };
  },

  async updateSite(input: SeoSiteUpdateInput) {
    const site = await repo.upsertSite({
      title: input.title ?? null,
      description: input.description ?? null,
      keywords: input.keywords ?? [],
      ogImage: input.ogImage || null,
      canonical: input.canonical || null,
    });
    return site;
  },

  async remove(id: string) {
    const existing = await repo.findMany();
    if (!existing.some((item) => item.id === id)) throw notFound("SEO 配置不存在");
    return repo.delete(id);
  },
};
