import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-6xl">✅</div>
      <h1 className="text-xl font-bold">Annonce envoyée !</h1>
      <p className="text-gray-600 text-sm max-w-xs mx-auto">
        Votre annonce est en cours de validation par notre équipe. Elle sera visible très bientôt.
      </p>
      <Link href="/" className="inline-block bg-zako-red text-white font-bold px-6 py-3 rounded-xl">
        Retour à l'accueil
      </Link>
    </div>
  );
}
