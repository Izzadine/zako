import { NextRequest, NextResponse } from "next/server";
import { prisma, HAS_DB } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Body: { isBlocked: boolean }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isBlocked } = await req.json();

  if (!HAS_DB) return NextResponse.json({ ok: true, demo: true });

  // TODO: vérifier le rôle ADMIN. Bloquer un user masque aussi ses annonces.
  await prisma.user.update({ where: { id }, data: { isBlocked: Boolean(isBlocked) } });
  if (isBlocked) {
    await prisma.listing.updateMany({ where: { userId: id }, data: { status: "DELETED" } });
  }
  return NextResponse.json({ ok: true });
}
