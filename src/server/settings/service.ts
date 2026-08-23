/**
 * Settings 模块 Service：设置读写
 */
import { settingsRepository as repo } from "./repository";

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export const settingsService = {
  async list() {
    const rows = await repo.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },

  async update(values: Record<string, unknown>) {
    const normalized = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, stringify(value)]),
    );
    await repo.upsertMany(normalized);
    return { updated: Object.keys(normalized).length };
  },
};
