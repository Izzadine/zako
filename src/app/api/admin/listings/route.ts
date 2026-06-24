import { NextRequest, NextResponse } from "next/server";
import { prisma, HAS_DB } from "@/lib/prisma";
import { normalizeChadPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Création d'une annonce par l'admin (route sous /api/admin/* => protégée par
// le middleware Basic Auth). L'annonce part directement EN LIGNE (status ACTIVE).
export async function POST(req: NextRequest) {
  if (!HAS_DB) return NextResponse.json({ id: "demo-created", status: "ACTIVE", demo: true }, { status: 201 });

  const body = await req.json().catch(() => ({}));

  if (!body.title || !body.price || !body.categoryId || !body.whatsapp) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }
  const whatsapp = normalizeChadPhone(body.whatsapp);
  if (!whatsapp) {
    return NextResponse.json(
      { error: "Numéro WhatsApp invalide. Format : +235 et 8 chiffres." },
      { status: 400 }
    );
  }

  try {
    // Propriétaire = compte admin du système.
    let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      admin = await prisma.user.create({
        data: { phone: "+235600000000", whatsapp: "+235600000000", name: "Admin Zako", role: "ADMIN" },
      });
    }

    const listing = await prisma.listing.create({
      data: {
        title: String(body.title).slice(0, 120),
        description: String(body.description ?? "").slice(0, 2000),
        price: Math.max(0, Math.floor(Number(body.price))),
        categoryId: body.categoryId,
        district: body.district || null,
        whatsapp,
        allowCall: body.allowCall ?? true,
        userId: admin.id,
        status: "ACTIVE", // publiée immédiatement
        featured: Boolean(body.featured),
        featuredUntil: body.featured ? new Date(Date.now() + 7 * 86400_000) : null,
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
  } catch (e) {
    console.error("[admin create listing] error:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la création." }, { status: 500 });
  }
}
