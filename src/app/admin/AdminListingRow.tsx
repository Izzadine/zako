"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminListingRow({
  id,
  title,
  price,
  category,
  phone,
  thumbnail,
}: {
  id: string;
  title: string;
  price: string;
  category: string;
  phone: string;
  thumbnail: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(payload: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3">
      <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">📷</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium line-clamp-1">{title}</p>
        <p className="text-sm text-zako-red font-bold">{price}</p>
        <p className="text-xs text-gray-500">{category} · {phone}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => act({ status: "ACTIVE" })}
            disabled={busy}
            className="flex-1 bg-green-600 text-white text-sm font-bold py-2 rounded-lg disabled:opacity-50"
          >
            ✓ Valider
          </button>
          <button
            onClick={() => act({ status: "ACTIVE", featured: true, featuredDays: 7 })}
            disabled={busy}
            className="bg-amber-500 text-white text-sm font-bold px-3 py-2 rounded-lg disabled:opacity-50"
          >
            ⭐
          </button>
          <button
            onClick={() => act({ status: "REJECTED" })}
            disabled={busy}
            className="bg-gray-200 text-gray-700 text-sm font-bold px-3 py-2 rounded-lg disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
