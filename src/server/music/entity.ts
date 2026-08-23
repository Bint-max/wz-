/**
 * Music 模块领域类型
 */
import type { MusicStatus } from "@prisma/client";

export type MusicItem = {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  url: string;
  lyric: string | null;
  category: string | null;
  categoryId: string | null;
  isRecommend: boolean;
  isHomeBgm: boolean;
  playCount: number;
  sort: number;
  status: MusicStatus;
  createdAt: Date;
  updatedAt: Date;
};
