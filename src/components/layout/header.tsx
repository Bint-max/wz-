/**
 * 站点顶部导航（卡哇伊版）
 */
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-background/75 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-violet-300 text-sm shadow-soft transition group-hover:rotate-6">
            🌸
          </span>
          <span className="font-cute text-lg font-semibold text-foreground">
            {settings.siteName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NavLinks />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
