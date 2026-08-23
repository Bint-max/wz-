import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveUpload, type UploadKind } from "@/lib/upload";
import { ok, fail, handleError } from "@/lib/api";

const KINDS: UploadKind[] = ["audio", "lyric", "cover"];

/**
 * POST /api/admin/music/upload —— 上传音乐/歌词/封面文件（需登录）
 * multipart/form-data：file 文件字段，kind 可选（audio | lyric | cover，默认 audio）
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("请选择要上传的文件");

    const kindRaw = String(form.get("kind") ?? "audio") as UploadKind;
    const kind = KINDS.includes(kindRaw) ? kindRaw : "audio";

    const { url } = await saveUpload(file, kind);
    return ok({ url, kind });
  } catch (e) {
    return handleError(e);
  }
}
