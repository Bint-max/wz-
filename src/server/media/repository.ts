/**
 * Media 模块 Repository：文件元信息数据访问
 */
import { prisma } from "@/lib/prisma";
import type { MediaKind } from "@prisma/client";

export const mediaRepository = {
  findMany() {
    return prisma.media.findMany({
      include: { uploader: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  },

  create(data: {
    kind: MediaKind;
    driver: string;
    storageKey: string | null;
    url: string;
    originalName?: string | null;
    mimeType?: string | null;
    size?: number | null;
    hash?: string | null;
    uploaderId?: string | null;
  }) {
    return prisma.media.create({ data });
  },

  delete(id: string) {
    return prisma.media.delete({ where: { id } });
  },
};
