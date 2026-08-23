/**
 * Music 模块 Service
 */
import { notFound } from "@/lib/errors";
import type { MusicStatus } from "@prisma/client";
import { musicRepository as repo } from "./repository";
import type { MusicCreateInput } from "./schema";

export const musicService = {
  async listPublic(query: { category?: string; recommend?: boolean; home?: boolean }) {
    const where = {
      status: "ACTIVE" as MusicStatus,
      ...(query.category ? { category: query.category } : {}),
      ...(query.recommend ? { isRecommend: true } : {}),
      ...(query.home ? { isHomeBgm: true } : {}),
    };
    return repo.findPublic(where);
  },

  async getPublic(id: string) {
    const music = await repo.findById(id);
    if (!music || music.status !== "ACTIVE") throw notFound("音乐不存在");
    return music;
  },

  async play(id: string) {
    return repo.incrementPlayCount(id);
  },

  async adminList() {
    return repo.findManyAdmin();
  },

  async create(input: MusicCreateInput) {
    return repo.create({
      title: input.title,
      artist: input.artist,
      cover: input.cover || null,
      url: input.url,
      lyric: input.lyric || null,
      category: input.category || null,
      isRecommend: input.isRecommend ?? false,
      isHomeBgm: input.isHomeBgm ?? false,
      sort: input.sort ?? 0,
      status: input.status ?? "ACTIVE",
    });
  },

  async update(id: string, input: MusicCreateInput) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("音乐不存在");
    return repo.update(id, {
      title: input.title,
      artist: input.artist,
      cover: input.cover || null,
      url: input.url,
      lyric: input.lyric || null,
      category: input.category || null,
      isRecommend: input.isRecommend ?? false,
      isHomeBgm: input.isHomeBgm ?? false,
      sort: input.sort ?? 0,
      status: input.status ?? "ACTIVE",
    });
  },

  async remove(id: string) {
    const existing = await repo.findById(id);
    if (!existing) throw notFound("音乐不存在");
    return repo.delete(id);
  },

  async reorder(ids: string[]) {
    await repo.reorder(ids);
    return { reordered: ids.length };
  },
};
