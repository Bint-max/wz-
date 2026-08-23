/**
 * Media 模块 Service：文件元信息管理
 */
import { notFound } from "@/lib/errors";
import { mediaRepository as repo } from "./repository";
import type { MediaKind } from "@prisma/client";

export const mediaService = {
  async list() {
    return repo.findMany();
  },

  async record(input: {
    kind: MediaKind;
    url: string;
    originalName?: string | null;
    mimeType?: string | null;
    size?: number | null;
    hash?: string | null;
    uploaderId?: string | null;
  }) {
    return repo.create({
      kind: input.kind,
      driver: process.env.STORAGE_DRIVER ?? "local",
      storageKey: input.url,
      url: input.url,
      originalName: input.originalName ?? null,
      mimeType: input.mimeType ?? null,
      size: input.size ?? null,
      hash: input.hash ?? null,
      uploaderId: input.uploaderId ?? null,
    });
  },

  async remove(id: string) {
    const media = await repo.findById(id);
    if (!media) throw notFound("文件不存在");
    return repo.delete(id);
  },
};
