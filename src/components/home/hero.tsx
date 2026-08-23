/**
 * 首页顶部 Banner：卡哇伊个人空间
 */
import Image from "next/image";
import { Github, Mail, Sparkles } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { formatNumber } from "@/lib/utils";

type HeroProps = {
  settings: SiteSettings;
  stats: { postCount: number; totalViews: number; commentCount: number; totalVisits: number };
};

const STAT_STYLE = [
  { emoji: "📝", label: "文章", ring: "bg-pink-100 text-pink-500" },
  { emoji: "👀", label: "阅读量", ring: "bg-violet-100 text-violet-500" },
  { emoji: "💬", label: "评论", ring: "bg-sky-100 text-sky-500" },
  { emoji: "🐾", label: "访问量", ring: "bg-emerald-100 text-emerald-500" },
];

export function Hero({ settings, stats }: HeroProps) {
  const statValues = [stats.postCount, stats.totalViews, stats.commentCount, stats.totalVisits];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border-2 border-white/70 dark:border-white/10 bg-card/80 shadow-candy backdrop-blur">
      {/* 背景马卡龙渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/80 via-violet-50/60 to-sky-100/70 dark:from-pink-950/50 dark:via-violet-950/40 dark:to-sky-950/50" />

      {/* 漂浮小装饰 */}
      <Sparkles className="absolute left-8 top-8 h-5 w-5 animate-pulse text-pink-300" />
      <span className="absolute right-10 top-10 animate-float text-2xl">🎀</span>
      <span className="absolute bottom-8 left-12 animate-float-slow text-2xl">☁️</span>

      <div className="relative flex flex-col items-center gap-5 p-8 text-center sm:p-12">
        {/* 头像 */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-pink-300 via-violet-300 to-sky-300 opacity-70 blur-sm" />
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-soft">
            <Image
              src={settings.avatar}
              alt={settings.siteName}
              fill
              sizes="96px"
              className="object-cover"
              priority
            />
          </div>
          <span className="absolute -right-2 -top-1 rotate-12 text-xl">💗</span>
        </div>

        <div>
          <p className="font-cute text-sm text-pink-400">こんにちは · 欢迎来我的小窝 ✿</p>
          <h1 className="font-cute mt-2 text-3xl font-bold sm:text-4xl">
            <span className="kawaii-gradient-text">{settings.siteName}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {settings.bio}
          </p>
        </div>

        {/* 社交按钮 */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {settings.github && (
            <a
              href={settings.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-5 py-2 text-sm font-medium text-white shadow-soft transition hover:-translate-y-0.5 hover:scale-[1.03]"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          )}
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white/80 px-5 py-2 text-sm font-medium text-pink-500 transition hover:-translate-y-0.5 hover:bg-pink-50 dark:border-pink-400/30 dark:bg-white/10 dark:text-pink-300 dark:hover:bg-white/15"
            >
              <Mail className="h-4 w-4" /> 写信给我
            </a>
          )}
        </div>

        {/* 数据小卡片 */}
        <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_STYLE.map((item, i) => (
            <div key={item.label} className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-soft dark:border-white/10 dark:bg-white/10">
              <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-base ${item.ring}`}>
                {item.emoji}
              </span>
              <p className="mt-1 text-xl font-bold text-foreground">{formatNumber(statValues[i])}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
