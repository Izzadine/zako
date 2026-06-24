import { NextRequest, NextResponse } from "next/server";
import { prisma, HAS_DB } from "@/lib/prisma";
import { normalizeChadPhone } from "@/lib/utils";
import { hashOtp, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  if (!HAS_DB) return NextResponse.json({ error: "Authentification indisponible (mode démo)." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const phone = normalizeChadPhone(body.phone);
  const code = String(body.code ?? "").trim();
  if (!phone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Numéro ou code invalide." }, { status: 400 });
  }

  try {
    const otp = await prisma.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json({ error: "Code expiré ou introuvable. Demandez-en un nouveau." }, { status: 400 });
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Trop de tentatives. Demandez un nouveau code." }, { status: 429 });
    }
    if (otp.codeHash !== hashOtp(code, phone)) {
      await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: "Code incorrect." }, { status: 400 });
    }

    // Succès : on crée/retrouve le compte (le téléphone est l'identité).
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, whatsapp: phone },
    });
    await prisma.otpCode.deleteMany({ where: { phone } });
    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, phone: user.phone, name: user.name, whatsapp: user.whatsapp },
    });
  } catch (e) {
    console.error("[otp/verify] error:", e);
    return NextResponse.json({ error: "Erreur lors de la vérification." }, { status: 500 });
  }
}
