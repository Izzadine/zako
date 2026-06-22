import { NextRequest, NextResponse } from "next/server";
import { getListing } from "@/lib/data";
import { prisma, HAS_DB } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
  return NextResponse.json({ data: listing });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!HAS_DB) return NextResponse.json({ ok: true, demo: true });
  // TODO: vérifier que l'appelant est propriétaire ou admin.
  await prisma.listing.update({ where: { id }, data: { status: "DELETED" } });
  return NextResponse.json({ ok: true });
}
