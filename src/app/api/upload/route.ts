import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { fail, handleError } from "@/lib/api";
import { mediaService } from "@/server/media/service";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload —— 上传图片（需登录）
 * 使用 multipart/form-data，字段名 file
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("请选择要上传的图片");

    if (!ALLOWED.includes(file.type)) return fail("仅支持 jpg/png/webp/gif/svg 图片");
    if (file.size > MAX_SIZE) return fail("图片大小不能超过 5MB");

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `${Date.now()}-${randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    await mediaService.record({
      kind: "IMAGE",
      url: `/uploads/${filename}`,
      originalName: file.name,
      mimeType: file.type || null,
      size: file.size,
      uploaderId: admin.id,
    });

    return NextResponse.json({ success: true, data: { url: `/uploads/${filename}` } });
  } catch (e) {
    return handleError(e);
  }
}
