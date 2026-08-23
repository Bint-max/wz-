import type { Metadata } from "next";
import { MediaManager } from "@/components/admin/media-manager";

export const metadata: Metadata = { title: "文件管理" };

export default function MediaPage() {
  return <MediaManager />;
}
