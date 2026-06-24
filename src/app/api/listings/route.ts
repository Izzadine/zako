import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/data";
import { prisma, HAS_DB } from "@/lib/prisma";
import { normalizeChadPhone } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { PUBLISHING_OPEN } from "@/lib/config";

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
  // Phase de lancement : publication publique fermée (seul l'admin publie via /admin).
  if (!PUBLISHING_OPEN) {
    return NextResponse.json(
      { error: "La publication n'est pas encore ouverte au public. Contactez l'équipe Zako sur WhatsApp." },
      { status: 403 }
    );
  }

  const body = await req.json();

  // Validation minimale
  if (!body.title || !body.price || !body.categoryId || !body.whatsapp) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  // Validation + normalisation du numéro WhatsApp (format tchadien).
  const whatsapp = normalizeChadPhone(body.whatsapp);
  if (!whatsapp) {
    return NextResponse.json(
      { error: "Numéro WhatsApp invalide. Format attendu : +235 et 8 chiffres (ex. +235 66 12 34 56)." },
      { status: 400 }
    );
  }

  if (!HAS_DB) {
    // En mode démo on simule une création réussie.
    return NextResponse.json({ id: "demo-created", status: "PENDING", demo: true }, { status: 201 });
  }

  // Login obligatoire : il faut une session valide (OTP vérifié).
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise pour publier une annonce." }, { status: 401 });
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        title: String(body.title).slice(0, 120),
        description: String(body.description ?? "").slice(0, 2000),
        price: Math.max(0, Math.floor(Number(body.price))),
        categoryId: body.categoryId,
        district: body.district || null,
        whatsapp,
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
