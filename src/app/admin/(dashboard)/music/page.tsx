import { MusicManager } from "@/components/admin/music-manager";

export const metadata = { title: "音乐管理" };
export const dynamic = "force-dynamic";

export default function AdminMusicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cute text-2xl font-bold">音乐管理</h1>
        <p className="text-sm text-muted-foreground">
          维护前台音乐播放器的歌曲、封面、歌词与播放顺序
        </p>
      </div>
      <MusicManager />
    </div>
  );
}
