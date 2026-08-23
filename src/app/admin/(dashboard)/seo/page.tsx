import type { Metadata } from "next";
import { SeoSettings } from "@/components/admin/seo-settings";

export const metadata: Metadata = { title: "SEO 配置" };

export default function SeoPage() {
  return <SeoSettings />;
}
