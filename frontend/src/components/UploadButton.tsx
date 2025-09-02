import React, { useRef, useState } from "react";
import api from "../api/api";
import { ImagePlus, Loader2 } from "lucide-react";

type Props = {
  onUploaded?: (verdict: string, uploadsUsed: number) => void;
  disabled?: boolean;
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function UploadButton({ onUploaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert("File too large (max 50 MB).");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setBusy(true);
    try {
      const { data } = await api.post("/upload", form, {
        headers: { /* axios sets multipart boundary automatically */ }
      });
      onUploaded?.(data.verdict ?? "unknown", data.uploadsUsed ?? 0);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handlePick}
      />
      <button
        className="btn-primary w-full h-12 rounded-2xl text-base"
        onClick={openPicker}
        disabled={busy || disabled}
        title="Select an image or video"
      >
        {busy ? <Loader2 className="animate-spin" size={18} /> : <ImagePlus size={18} />}
        {busy ? "Uploading…" : "Select an Image"}
      </button>
    </>
  );
}
