import Link from "next/link";
import { formatPrice, thumb, timeAgo } from "@/lib/utils";
import type { ListingSummary } from "@/types";

export function ListingCard({ listing }: { listing: ListingSummary }) {
  const src = thumb(listing.thumbnail, 500);
  return (
    <Link href={`/annonce/${listing.id}`} className="block rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
      <div className="relative aspect-square bg-gray-100">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📷</div>
        )}
        {listing.featured && (
          <span className="absolute top-2 left-2 bg-zako-red text-white text-[10px] font-bold px-2 py-1 rounded-full">
            ⭐ EN AVANT
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="font-bold text-zako-red leading-tight">{formatPrice(listing.price)}</p>
        <p className="text-sm text-gray-800 line-clamp-1">{listing.title}</p>
        <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
          <span className="truncate">📍 {listing.district ?? listing.city}</span>
          <span className="whitespace-nowrap ml-1">{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
