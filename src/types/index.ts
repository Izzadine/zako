export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  order: number;
};

export type ListingPhoto = { url: string };

export type ListingSummary = {
  id: string;
  title: string;
  price: number;
  city: string;
  district: string | null;
  featured: boolean;
  thumbnail: string | null;
  category: { slug: string; name: string };
  createdAt: string;
};

export type ListingDetail = ListingSummary & {
  description: string;
  whatsapp: string;
  allowCall: boolean;
  photos: ListingPhoto[];
  viewsCount: number;
};

export type ListingFilters = {
  category?: string;
  q?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
};
