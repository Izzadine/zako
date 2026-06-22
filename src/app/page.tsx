import Link from "next/link";
import { getCategories, getListings } from "@/lib/data";
import { HAS_DB } from "@/lib/prisma";
import { CategoryNav } from "@/components/CategoryNav";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, { data: listings }] = await Promise.all([
    getCategories(),
    getListings({ page: 1 }),
  ]);

  return (
    <div className="space-y-4">
      {!HAS_DB && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2">
          Mode <b>DÉMO</b> : données fictives. Configure <code>DATABASE_URL</code> pour activer la vraie base.
        </div>
      )}

      <CategoryNav categories={categories} />

      <Link
        href="/publier"
        className="block bg-gradient-to-r from-zako-dark to-[#2a4a73] text-white rounded-2xl p-4"
      >
        <p className="font-bold text-lg">Vendez en 3 clics 🚀</p>
        <p className="text-sm text-white/80">Publiez gratuitement et soyez contacté sur WhatsApp.</p>
      </Link>

      <div>
        <h2 className="font-bold text-gray-800 mb-2">Annonces récentes</h2>
        {listings.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">Aucune annonce pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
