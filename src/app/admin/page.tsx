import Link from "next/link";
import { prisma, HAS_DB } from "@/lib/prisma";
import { AdminListingRow } from "./AdminListingRow";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getByStatus(status: "PENDING" | "ACTIVE") {
  if (!HAS_DB) return [];
  try {
    return await prisma.listing.findMany({
      where: { status },
      include: { category: true, photos: { take: 1 }, user: true },
      orderBy: status === "PENDING" ? { createdAt: "asc" } : { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getStats() {
  if (!HAS_DB) return { active: 0, pending: 0, users: 0 };
  try {
    const [active, pending, users] = await Promise.all([
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
    ]);
    return { active, pending, users };
  } catch {
    return { active: 0, pending: 0, users: 0 };
  }
}

export default async function AdminPage() {
  const [pending, active, stats] = await Promise.all([
    getByStatus("PENDING"),
    getByStatus("ACTIVE"),
    getStats(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">Admin Zako</h1>
        <Link href="/" className="text-sm text-gray-500">← Site</Link>
      </div>

      <Link
        href="/admin/nouvelle"
        className="flex items-center justify-center gap-2 w-full bg-zako-red text-white font-bold py-3 rounded-xl"
      >
        + Publier une annonce
      </Link>

      {!HAS_DB && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2">
          Mode DÉMO : configure <code>DATABASE_URL</code> puis <code>npm run db:seed</code> pour modérer de vraies annonces.
          <br />⚠️ Pense à protéger <code>/admin</code> par authentification ADMIN avant la mise en production.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Actives", value: stats.active, color: "text-green-600" },
          { label: "En attente", value: stats.pending, color: "text-amber-600" },
          { label: "Utilisateurs", value: stats.users, color: "text-zako-dark" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-bold mb-2">Annonces à valider ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm py-6 text-center">Aucune annonce en attente. 🎉</p>
        ) : (
          <div className="space-y-3">
            {pending.map((l) => (
              <AdminListingRow
                key={l.id}
                mode="pending"
                id={l.id}
                title={l.title}
                price={formatPrice(l.price)}
                category={l.category.name}
                phone={l.whatsapp}
                thumbnail={l.photos[0]?.url ?? null}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-bold mb-2">Annonces en ligne ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-gray-500 text-sm py-6 text-center">Aucune annonce en ligne pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {active.map((l) => (
              <AdminListingRow
                key={l.id}
                mode="active"
                id={l.id}
                title={l.title}
                price={formatPrice(l.price)}
                category={l.category.name}
                phone={l.whatsapp}
                thumbnail={l.photos[0]?.url ?? null}
                featured={l.featured}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
