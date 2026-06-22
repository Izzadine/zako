import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/data";
import { prisma, HAS_DB } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = await getListings({
    category: sp.get("category") ?? undefined,
    q: sp.get("q") ?? undefined,
    district: sp.get("district") ?? undefined,
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    page: sp.get("page") ? Number(sp.get("page")) : 1,
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validation minimale
  if (!body.title || !body.price || !body.categoryId || !body.whatsapp) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  if (!HAS_DB) {
    // En mode démo on simule une création réussie.
    return NextResponse.json({ id: "demo-created", status: "PENDING", demo: true }, { status: 201 });
  }

  try {
    // TODO: remplacer par l'utilisateur de la session (OTP). Pour l'instant, on
    // rattache à un compte "invité" identifié par le numéro WhatsApp.
    const user = await prisma.user.upsert({
      where: { phone: body.whatsapp },
      update: {},
      create: { phone: body.whatsapp, whatsapp: body.whatsapp },
    });

    const listing = await prisma.listing.create({
      data: {
        title: String(body.title).slice(0, 120),
        description: String(body.description ?? "").slice(0, 2000),
        price: Math.max(0, Math.floor(Number(body.price))),
        categoryId: body.categoryId,
        district: body.district || null,
        whatsapp: body.whatsapp,
        allowCall: body.allowCall ?? true,
        userId: user.id,
        status: "PENDING",
        photos: {
          create: (body.photos ?? []).slice(0, 5).map((p: any, i: number) => ({
            url: p.url,
            publicId: p.publicId ?? "",
            order: i,
          })),
        },
      },
    });

    return NextResponse.json({ id: listing.id, status: listing.status }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur serveur lors de la création." }, { status: 500 });
  }
}
