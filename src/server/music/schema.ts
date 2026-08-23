/**
 * Music 模块入参校验（zod DTO）
 */
import { z } from "zod";

export { musicSchema as musicCreateSchema, musicSchema as musicUpdateSchema } from "@/lib/validation";

export const musicReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "至少需要一首歌曲"),
});

export type MusicCreateInput = {
  title: string;
  artist: string;
  cover?: string | null;
  url: string;
  lyric?: string | null;
  category?: string | null;
  isRecommend?: boolean;
  isHomeBgm?: boolean;
  sort?: number;
  status?: "ACTIVE" | "DISABLED";
};
