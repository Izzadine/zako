import { notFound } from "next/navigation";
import Link from "next/link";
import { getListing } from "@/lib/data";
import { formatPrice, thumb, timeAgo, telLink } from "@/lib/utils";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <div className="space-y-4 pb-4">
      <Link href="/" className="text-sm text-gray-500">← Retour</Link>

      {/* Galerie photos — scroll horizontal, léger */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 no-scrollbar snap-x">
        {listing.photos.length > 0 ? (
          listing.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={thumb(p.url, 800) ?? ""}
              alt={`${listing.title} ${i + 1}`}
              className="w-72 h-72 object-cover rounded-xl bg-gray-100 snap-center shrink-0"
            />
          ))
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-5xl text-gray-300">📷</div>
        )}
      </div>

      <div>
        <p className="text-2xl font-extrabold text-zako-red">{formatPrice(listing.price)}</p>
        <h1 className="text-lg font-bold text-gray-900 mt-1">{listing.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
          <span>📍 {listing.district ?? listing.city}</span>
          <span>· {timeAgo(listing.createdAt)}</span>
          <span>· 👁 {listing.viewsCount}</span>
        </div>
        <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
          {listing.category.name}
        </span>
      </div>

      <div>
        <h2 className="font-bold text-gray-800 mb-1">Description</h2>
        <p className="text-gray-700 whitespace-pre-line text-[15px] leading-relaxed">{listing.description}</p>
      </div>

      {/* Barre de contact fixe en bas */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 md:hidden">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex gap-2">
          {listing.allowCall && (
            <a
              href={telLink(listing.whatsapp)}
              className="flex items-center justify-center w-14 rounded-xl border-2 border-zako-wa text-zako-wa text-xl"
              aria-label="Appeler"
            >
              📞
            </a>
          )}
          <div className="flex-1">
            <WhatsAppButton phone={listing.whatsapp} title={listing.title} id={listing.id} />
          </div>
        </div>
      </div>

      {/* Version desktop */}
      <div className="hidden md:block max-w-sm">
        <WhatsAppButton phone={listing.whatsapp} title={listing.title} id={listing.id} />
      </div>
    </div>
  );
}
