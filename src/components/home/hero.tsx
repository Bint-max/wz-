/**
 * 首页个人简介 + 站点统计
 */
import Image from "next/image";
import { Github, Mail } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { formatNumber } from "@/lib/utils";

type HeroProps = {
  settings: SiteSettings;
  stats: { postCount: number; totalViews: number; commentCount: number; totalVisits: number };
};

export function Hero({ settings, stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent" />
      <div className="relative flex flex-col items-center gap-6 p-8 text-center sm:p-12">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-lg">
          <Image
            src={settings.avatar}
            alt={settings.siteName}
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{settings.siteName}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {settings.bio}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {settings.github && (
            <a
              href={settings.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border bg-background px-4 py-1.5 text-sm transition hover:bg-muted"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          )}
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-1.5 rounded-full border bg-background px-4 py-1.5 text-sm transition hover:bg-muted"
            >
              <Mail className="h-4 w-4" /> 联系我
            </a>
          )}
        </div>

        <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "文章", value: stats.postCount },
            { label: "阅读量", value: stats.totalViews },
            { label: "评论", value: stats.commentCount },
            { label: "访问量", value: stats.totalVisits },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-background/70 p-3">
              <p className="text-xl font-bold">{formatNumber(item.value)}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
