import { getCategories, getListings } from "@/lib/data";
import { SearchFilters } from "@/components/SearchFilters";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const categories = await getCategories();
  const { data, total } = await getListings({
    category: sp.category,
    q: sp.q,
    district: sp.district,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">Rechercher</h1>
      <SearchFilters categories={categories} />

      <p className="text-sm text-gray-500">{total} résultat{total > 1 ? "s" : ""}</p>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Aucune annonce ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {data.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
