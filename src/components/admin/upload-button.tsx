"use client";

/**
 * 图片上传按钮
 */
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

export function UploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      onUploaded(data.data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition hover:bg-muted disabled:opacity-50"
      >
        <ImagePlus className="h-4 w-4" />
        {uploading ? "上传中..." : "上传图片"}
      </button>
    </>
  );
}
