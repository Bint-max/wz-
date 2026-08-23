"use client";

/**
 * 卡哇伊动画按钮
 * 点击时弹跳，悬停时轻微放大。
 */
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "soft";
  className?: string;
  disabled?: boolean;
};

export function CuteButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className,
  disabled,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "cute-btn-pop inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] disabled:opacity-50",
        variant === "primary"
          ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-soft hover:shadow-candy"
          : "border border-pink-200 bg-white/80 text-pink-500 hover:bg-pink-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
