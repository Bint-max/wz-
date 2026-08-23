/**
 * 站点页脚
 */
import Link from "next/link";
import { Github, Mail, Rss } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-semibold">{settings.siteName}</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {settings.siteDescription}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/rss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RSS 订阅"
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground"
            >
              <Rss className="h-4 w-4" />
            </a>
            {settings.github && (
              <a
                href={settings.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                aria-label="邮箱"
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            © {year} {settings.siteName} · Powered by{" "}
            <Link href="https://nextjs.org" target="_blank" className="underline">
              Next.js
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
