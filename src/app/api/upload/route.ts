import { NextRequest, NextResponse } from "next/server";
import { uploadImage, HAS_CLOUDINARY } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image trop lourde (max 8 Mo)." }, { status: 400 });
  }

  // Mode démo : pas de Cloudinary → on renvoie l'image en data URL (suffisant pour tester l'UI).
  if (!HAS_CLOUDINARY) {
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`;
    return NextResponse.json({ url: dataUrl, publicId: "demo", demo: true });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadImage(buffer);
    return NextResponse.json({ url, publicId });
  } catch {
    return NextResponse.json({ error: "Échec de l'upload." }, { status: 500 });
  }
}
