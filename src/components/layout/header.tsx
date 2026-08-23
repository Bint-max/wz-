/**
 * 站点顶部导航
 */
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {settings.siteName.slice(0, 1)}
          </span>
          <span>{settings.siteName}</span>
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
