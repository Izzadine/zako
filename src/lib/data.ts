import { prisma, HAS_DB } from "@/lib/prisma";
import { DEMO_CATEGORIES, DEMO_LISTINGS } from "@/lib/demo-data";
import type { Category, ListingDetail, ListingSummary, ListingFilters } from "@/types";

const PER_PAGE = 20;

export async function getCategories(): Promise<Category[]> {
  if (!HAS_DB) return DEMO_CATEGORIES;
  try {
    return await prisma.category.findMany({ orderBy: { order: "asc" } });
  } catch {
    return DEMO_CATEGORIES;
  }
}

export async function getListings(
  filters: ListingFilters
): Promise<{ data: ListingSummary[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, filters.page ?? 1);

  if (!HAS_DB) return filterDemo(filters, page);

  try {
    const where: any = { status: "ACTIVE" };
    if (filters.category) where.category = { slug: filters.category };
    if (filters.district) where.district = filters.district;
    if (filters.minPrice != null) where.price = { ...where.price, gte: filters.minPrice };
    if (filters.maxPrice != null) where.price = { ...where.price, lte: filters.maxPrice };
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { category: true, photos: { take: 1, orderBy: { order: "asc" } } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      data: rows.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        city: l.city,
        district: l.district,
        featured: l.featured,
        thumbnail: l.photos[0]?.url ?? null,
        category: { slug: l.category.slug, name: l.category.name },
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    };
  } catch {
    return filterDemo(filters, page);
  }
}

export async function getListing(id: string): Promise<ListingDetail | null> {
  if (!HAS_DB) return DEMO_LISTINGS.find((l) => l.id === id) ?? null;
  try {
    const l = await prisma.listing.findUnique({
      where: { id },
      include: { category: true, photos: { orderBy: { order: "asc" } } },
    });
    if (!l || l.status !== "ACTIVE") return null;
    prisma.listing.update({ where: { id }, data: { viewsCount: { increment: 1 } } }).catch(() => {});
    return {
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      city: l.city,
      district: l.district,
      featured: l.featured,
      thumbnail: l.photos[0]?.url ?? null,
      category: { slug: l.category.slug, name: l.category.name },
      createdAt: l.createdAt.toISOString(),
      whatsapp: l.whatsapp,
      allowCall: l.allowCall,
      photos: l.photos.map((p) => ({ url: p.url })),
      viewsCount: l.viewsCount,
    };
  } catch {
    return DEMO_LISTINGS.find((l) => l.id === id) ?? null;
  }
}

function filterDemo(filters: ListingFilters, page: number) {
  let rows = [...DEMO_LISTINGS];
  if (filters.category) rows = rows.filter((l) => l.category.slug === filters.category);
  if (filters.district) rows = rows.filter((l) => l.district === filters.district);
  if (filters.minPrice != null) rows = rows.filter((l) => l.price >= filters.minPrice!);
  if (filters.maxPrice != null) rows = rows.filter((l) => l.price <= filters.maxPrice!);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
  }
  rows.sort((a, b) => Number(b.featured) - Number(a.featured) || +new Date(b.createdAt) - +new Date(a.createdAt));
  const total = rows.length;
  const data: ListingSummary[] = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return { data, total, page, totalPages: Math.max(1, Math.ceil(total / PER_PAGE)) };
}
