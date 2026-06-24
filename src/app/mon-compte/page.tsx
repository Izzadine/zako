"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { normalizeChadPhone } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useMe();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function requestCode() {
    setError(null);
    setInfo(null);
    if (!normalizeChadPhone(phone)) {
      setError("Numéro invalide. Format : +235 et 8 chiffres.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setStep("code");
      if (json.stub) {
        setInfo(
          json.devCode
            ? `Mode test : ton code est ${json.devCode} (les vrais SMS s'activent avec les clés Twilio).`
            : "Mode test : le code s'affiche dans les logs du serveur."
        );
      } else {
        setInfo("Code envoyé par SMS. Vérifie tes messages.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-10 text-center">Chargement…</p>;
  }

  // --- Connecté ---
  if (user) {
    return (
      <div className="space-y-4">
        <h1 className="font-bold text-lg">Mon compte</h1>
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-1">
          <p className="text-sm text-gray-500">Connecté en tant que</p>
          <p className="font-bold text-lg">{user.phone}</p>
          <span className="inline-block text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
            ✓ Numéro vérifié
          </span>
        </div>
        <button
          onClick={() => router.push("/publier")}
          className="w-full bg-zako-red text-white font-bold py-3 rounded-xl"
        >
          + Publier une annonce
        </button>
        <button
          onClick={async () => {
            await logout();
            router.refresh();
          }}
          className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  // --- Non connecté : flux OTP ---
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">Connexion</h1>
      <p className="text-sm text-gray-500">
        Connecte-toi avec ton numéro de téléphone pour publier et gérer tes annonces.
      </p>

      {step === "phone" ? (
        <div className="space-y-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="Ton numéro (+235…)"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base"
          />
          {error && <p className="text-sm text-zako-red">{error}</p>}
          <button
            onClick={requestCode}
            disabled={busy}
            className="w-full bg-zako-dark text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {busy ? "Envoi…" : "Recevoir le code"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {info && <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{info}</p>}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="Code à 6 chiffres"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl tracking-[0.4em]"
          />
          {error && <p className="text-sm text-zako-red">{error}</p>}
          <button
            onClick={verifyCode}
            disabled={busy || code.length !== 6}
            className="w-full bg-zako-red text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {busy ? "Vérification…" : "Se connecter"}
          </button>
          <button
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
              setInfo(null);
            }}
            className="w-full text-gray-500 text-sm py-2"
          >
            ← Changer de numéro
          </button>
        </div>
      )}
    </div>
  );
}
