import { NextRequest, NextResponse } from "next/server";
import { prisma, HAS_DB } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH : valider / rejeter / supprimer / mettre en avant une annonce.
// Body: { status?: "ACTIVE"|"REJECTED"|"DELETED"|"SOLD", featured?: boolean, featuredDays?: number }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!HAS_DB) return NextResponse.json({ ok: true, demo: true });

  // TODO: vérifier le rôle ADMIN via la session.
  const data: any = {};
  if (body.status) data.status = body.status;
  if (typeof body.featured === "boolean") {
    data.featured = body.featured;
    data.featuredUntil = body.featured
      ? new Date(Date.now() + (body.featuredDays ?? 7) * 86400_000)
      : null;
  }

  const listing = await prisma.listing.update({ where: { id }, data });
  return NextResponse.json({ ok: true, listing });
}
