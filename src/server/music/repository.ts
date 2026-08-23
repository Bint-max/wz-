/**
 * Music 模块 Repository
 */
import { prisma } from "@/lib/prisma";
import type { MusicStatus, Prisma } from "@prisma/client";

export const musicRepository = {
  findPublic(where: Prisma.MusicWhereInput) {
    return prisma.music.findMany({
      where,
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    });
  },

  findById(id: string) {
    return prisma.music.findUnique({ where: { id } });
  },

  findManyAdmin() {
    return prisma.music.findMany({
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    });
  },

  create(data: Prisma.MusicUncheckedCreateInput) {
    return prisma.music.create({ data });
  },

  update(id: string, data: Prisma.MusicUncheckedUpdateInput) {
    return prisma.music.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.music.delete({ where: { id } });
  },

  incrementPlayCount(id: string) {
    return prisma.music.update({
      where: { id },
      data: { playCount: { increment: 1 } },
      select: { id: true, playCount: true },
    });
  },

  reorder(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) => prisma.music.update({ where: { id }, data: { sort: index + 1 } })),
    );
  },
};
