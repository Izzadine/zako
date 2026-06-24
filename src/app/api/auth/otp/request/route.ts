import { NextRequest, NextResponse } from "next/server";
import { prisma, HAS_DB } from "@/lib/prisma";
import { normalizeChadPhone } from "@/lib/utils";
import { generateOtp, hashOtp } from "@/lib/auth";
import { sendSms, otpMessage } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!HAS_DB) return NextResponse.json({ error: "Authentification indisponible (mode démo)." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const phone = normalizeChadPhone(body.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Numéro invalide. Format : +235 et 8 chiffres (ex. +235 66 12 34 56)." },
      { status: 400 }
    );
  }

  try {
    // Anti-spam : pas plus d'un code toutes les 60 secondes par numéro.
    const recent = await prisma.otpCode.findFirst({
      where: { phone, createdAt: { gt: new Date(Date.now() - 60_000) } },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      return NextResponse.json({ error: "Un code a déjà été envoyé. Réessayez dans 1 minute." }, { status: 429 });
    }

    const code = generateOtp();
    await prisma.otpCode.deleteMany({ where: { phone } }); // invalide les anciens
    await prisma.otpCode.create({
      data: { phone, codeHash: hashOtp(code, phone), expiresAt: new Date(Date.now() + 5 * 60_000) },
    });

    const { stub } = await sendSms(phone, otpMessage(code));

    // En mode stub hors production, on renvoie le code pour faciliter les tests.
    const devCode = stub && process.env.NODE_ENV !== "production" ? code : undefined;
    return NextResponse.json({ ok: true, stub, devCode });
  } catch (e) {
    console.error("[otp/request] error:", e);
    return NextResponse.json({ error: "Erreur lors de l'envoi du code." }, { status: 500 });
  }
}
