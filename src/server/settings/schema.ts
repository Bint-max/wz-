/**
 * Settings 模块入参校验（zod DTO）
 */
import { z } from "zod";

export const settingsUpdateSchema = z
  .record(z.unknown())
  .refine((obj) => Object.keys(obj).length > 0, "至少需要一项设置");

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
