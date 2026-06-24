"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhotoUploader, type UploadedPhoto } from "@/components/PhotoUploader";
import { normalizeChadPhone } from "@/lib/utils";
import type { Category } from "@/types";

export default function AdminNewListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: "",
    district: "",
    whatsapp: "",
    featured: false,
  });
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data ?? []))
      .catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError(null);
    if (!form.title || !form.price || !form.categoryId || !form.whatsapp) {
      setError("Catégorie, titre, prix et numéro WhatsApp sont obligatoires.");
      return;
    }
    const phone = normalizeChadPhone(form.whatsapp);
    if (!phone) {
      setError("Numéro WhatsApp invalide. Format : +235 et 8 chiffres.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, whatsapp: phone, price: Number(form.price), photos }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setDone(true);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-lg font-bold">Annonce publiée et en ligne !</h1>
        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <button
            onClick={() => {
              setForm({ categoryId: "", title: "", description: "", price: "", district: "", whatsapp: "", featured: false });
              setPhotos([]);
              setDone(false);
              setSubmitting(false);
            }}
            className="bg-zako-red text-white font-bold py-3 rounded-xl"
          >
            + Publier une autre
          </button>
          <Link href="/admin" className="border border-gray-200 text-gray-600 font-medium py-3 rounded-xl">
            Retour à l'admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg">Nouvelle annonce</h1>
        <Link href="/admin" className="text-sm text-gray-500">← Admin</Link>
      </div>
      <p className="text-xs text-gray-400">Publiée par l'équipe Zako, mise en ligne immédiatement.</p>

      <select
        value={form.categoryId}
        onChange={(e) => set("categoryId", e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"
      >
        <option value="">Catégorie *</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>

      <input
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="Titre * (ex: Toyota Corolla 2015)"
        className="w-full rounded-xl border border-gray-200 px-4 py-3"
      />
      <textarea
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Description (état, détails…)"
        rows={4}
        className="w-full rounded-xl border border-gray-200 px-4 py-3"
      />
      <input
        value={form.price}
        onChange={(e) => set("price", e.target.value)}
        inputMode="numeric"
        placeholder="Prix en FCFA *"
        className="w-full rounded-xl border border-gray-200 px-4 py-3"
      />
      <input
        value={form.district}
        onChange={(e) => set("district", e.target.value)}
        placeholder="Quartier (ex: Moursal)"
        className="w-full rounded-xl border border-gray-200 px-4 py-3"
      />

      <PhotoUploader photos={photos} onChange={setPhotos} />

      <input
        value={form.whatsapp}
        onChange={(e) => set("whatsapp", e.target.value)}
        inputMode="tel"
        placeholder="Numéro WhatsApp du vendeur * (+235…)"
        className={`w-full rounded-xl border px-4 py-3 ${
          form.whatsapp && !normalizeChadPhone(form.whatsapp) ? "border-zako-red" : "border-gray-200"
        }`}
      />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="w-4 h-4"
        />
        ⭐ Mettre en avant (7 jours)
      </label>

      {error && <p className="text-sm text-zako-red">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full bg-zako-red text-white font-bold py-3 rounded-xl disabled:opacity-50"
      >
        {submitting ? "Publication…" : "Publier en ligne"}
      </button>
    </div>
  );
}
