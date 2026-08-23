/**
 * Media 模块领域类型
 */
import type { MediaKind } from "@prisma/client";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  driver: string;
  storageKey: string | null;
  url: string;
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  hash: string | null;
  createdAt: Date;
  uploader: { name: string } | null;
};
