"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoUploader, type UploadedPhoto } from "@/components/PhotoUploader";
import { normalizeChadPhone } from "@/lib/utils";
import type { Category } from "@/types";

export default function PublishPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: "",
    district: "",
    whatsapp: "",
  });
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data ?? []))
      .catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError(null);
    if (!form.title || !form.price || !form.categoryId || !form.whatsapp) {
      setError("Merci de remplir les champs obligatoires.");
      return;
    }
    const phone = normalizeChadPhone(form.whatsapp);
    if (!phone) {
      setError("Numéro WhatsApp invalide. Format : +235 et 8 chiffres (ex. +235 66 12 34 56).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, whatsapp: phone, price: Number(form.price), photos }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur lors de la publication");
      router.push(`/publier/merci`);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-zako-red" : "bg-gray-200"}`} />
        ))}
      </div>

      {/* Étape 1 : catégorie */}
      {step === 1 && (
        <div className="space-y-4">
          <h1 className="font-bold text-lg">1. Quelle catégorie ?</h1>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  set("categoryId", c.id);
                  setStep(2);
                }}
                className={`p-4 rounded-xl border text-left ${
                  form.categoryId === c.id ? "border-zako-red bg-red-50" : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <p className="font-medium mt-1">{c.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2 : détails */}
      {step === 2 && (
        <div className="space-y-3">
          <h1 className="font-bold text-lg">2. Décrivez votre article</h1>
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
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border border-gray-200">
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.title || !form.price}
              className="flex-1 bg-zako-dark text-white font-bold py-3 rounded-xl disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : photos + contact */}
      {step === 3 && (
        <div className="space-y-4">
          <h1 className="font-bold text-lg">3. Photos & contact</h1>
          <PhotoUploader photos={photos} onChange={setPhotos} />
          <div>
            <div className="relative">
              <input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                inputMode="tel"
                placeholder="Numéro WhatsApp * (+235…)"
                className={`w-full rounded-xl border px-4 py-3 pr-10 ${
                  form.whatsapp && !normalizeChadPhone(form.whatsapp)
                    ? "border-zako-red"
                    : "border-gray-200"
                }`}
              />
              {form.whatsapp && normalizeChadPhone(form.whatsapp) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">✓</span>
              )}
            </div>
            {form.whatsapp && !normalizeChadPhone(form.whatsapp) ? (
              <p className="text-xs text-zako-red mt-1">
                Format attendu : +235 et 8 chiffres (mobile commençant par 6, 7 ou 9).
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Ex. +235 66 12 34 56 — le numéro qui recevra les contacts.</p>
            )}
          </div>
          {error && <p className="text-sm text-zako-red">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-gray-200">
              Retour
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="flex-1 bg-zako-red text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {submitting ? "Publication…" : "Publier mon annonce"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
