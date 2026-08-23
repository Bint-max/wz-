/**
 * Settings 模块 Repository：仅封装 site_setting 表访问
 */
import { prisma } from "@/lib/prisma";

export const settingsRepository = {
  async findMany() {
    return prisma.siteSetting.findMany();
  },

  async upsertMany(values: Record<string, string>) {
    return prisma.$transaction(
      Object.entries(values).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );
  },
};
