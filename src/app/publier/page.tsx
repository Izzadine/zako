"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhotoUploader, type UploadedPhoto } from "@/components/PhotoUploader";
import { normalizeChadPhone } from "@/lib/utils";
import { PUBLISHING_OPEN, ZAKO_WHATSAPP } from "@/lib/config";
import { useMe } from "@/hooks/useMe";
import type { Category } from "@/types";

export default function PublishPage() {
  const router = useRouter();
  const { user, loading } = useMe();
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

  // Pré-remplit le numéro WhatsApp avec celui du compte connecté.
  useEffect(() => {
    const num = user?.whatsapp ?? user?.phone;
    if (num) setForm((f) => (f.whatsapp ? f : { ...f, whatsapp: num }));
  }, [user]);

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

  // Phase de lancement : publication réservée à l'équipe Zako.
  if (!PUBLISHING_OPEN) {
    const waLink = `https://wa.me/${ZAKO_WHATSAPP.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
      "Bonjour Zako, je souhaite publier une annonce."
    )}`;
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-5xl">📣</div>
        <h1 className="text-lg font-bold">Vous voulez vendre ?</h1>
        <p className="text-gray-600 text-sm max-w-xs mx-auto">
          Pour l'instant, c'est l'équipe Zako qui publie les annonces. Envoyez-nous votre article
          (photos + prix) sur WhatsApp, on le met en ligne pour vous, gratuitement.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-zako-wa text-white font-bold px-6 py-3 rounded-xl"
        >
          Envoyer mon annonce sur WhatsApp
        </a>
      </div>
    );
  }

  // Connexion obligatoire pour publier.
  if (loading) {
    return <p className="text-gray-400 text-sm py-10 text-center">Chargement…</p>;
  }
  if (!user) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-5xl">🔒</div>
        <h1 className="text-lg font-bold">Connexion requise</h1>
        <p className="text-gray-600 text-sm max-w-xs mx-auto">
          Pour publier une annonce, connecte-toi avec ton numéro de téléphone (c'est gratuit et rapide).
        </p>
        <Link href="/mon-compte" className="inline-block bg-zako-red text-white font-bold px-6 py-3 rounded-xl">
          Se connecter
        </Link>
      </div>
    );
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
