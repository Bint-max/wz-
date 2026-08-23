import type { Metadata, Viewport } from "next";
import { ZCOOL_KuaiLe } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { BubbleCursor } from "@/components/ui/BubbleCursor";
import { MusicPlayer } from "@/components/music/music-player";
import { FloatingDecor } from "@/components/home/FloatingDecor";
import { getSiteSettings } from "@/lib/settings";

// 可爱圆润字体（日系手写风），通过 CSS 变量 --font-cute 使用
const cuteFont = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cute",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    keywords: ["博客", "技术", "Next.js", "React", "TypeScript", "全栈开发", "卡哇伊"],
    authors: [{ name: settings.siteName }],
    creator: settings.siteName,
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: settings.siteName,
      title: settings.siteTitle,
      description: settings.siteDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#241a2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={cuteFont.variable}>
      <body>
        <ThemeProvider>
          <FloatingDecor />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <BackToTop />
          <BubbleCursor />
          <MusicPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}
