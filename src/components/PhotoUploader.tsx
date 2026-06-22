"use client";

import { useState } from "react";

export type UploadedPhoto = { url: string; publicId: string };

export function PhotoUploader({
  photos,
  onChange,
  max = 5,
}: {
  photos: UploadedPhoto[];
  onChange: (p: UploadedPhoto[]) => void;
  max?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const slots = max - photos.length;
    const toUpload = Array.from(files).slice(0, slots);
    setBusy(true);
    const next = [...photos];
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Échec de l'upload");
        next.push({ url: json.url, publicId: json.publicId });
      } catch (e: any) {
        setError(e.message);
      }
    }
    onChange(next);
    setBusy(false);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
              className="absolute -top-1 -right-1 bg-zako-red text-white w-6 h-6 rounded-full text-xs"
            >
              ✕
            </button>
          </div>
        ))}
        {photos.length < max && (
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer">
            <span className="text-2xl">{busy ? "⏳" : "📷"}</span>
            <span className="text-[10px] mt-1">{busy ? "Envoi…" : "Ajouter"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={busy}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">{photos.length}/{max} photos</p>
      {error && <p className="text-xs text-zako-red mt-1">{error}</p>}
    </div>
  );
}
