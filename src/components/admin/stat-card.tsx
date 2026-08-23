/**
 * 数据看板统计卡片（卡哇伊版）
 */
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="cute-card-hover rounded-[1.5rem] border-2 border-white/70 bg-card/90 p-5 shadow-soft dark:border-white/10">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-violet-200">
          <Icon className="h-4 w-4 text-white" />
        </span>
      </div>
      <p className="font-cute mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
