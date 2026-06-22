export default function AccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">Mon compte</h1>
      <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
        <p className="text-sm text-gray-600">
          L'authentification par OTP téléphone est prévue (voir la roadmap). Pour le MVP, la publication
          est ouverte. À brancher : <code>POST /api/auth/otp/request</code> et <code>/verify</code>.
        </p>
        <button className="w-full bg-zako-dark text-white font-bold py-3 rounded-xl opacity-60" disabled>
          Se connecter avec mon numéro (bientôt)
        </button>
      </div>
      <div className="text-xs text-gray-400">
        Astuce dev : protéger <code>POST /api/listings</code> avec la session une fois l'OTP en place.
      </div>
    </div>
  );
}
