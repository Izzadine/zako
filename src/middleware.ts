import { NextRequest, NextResponse } from "next/server";

// Protège /admin et /api/admin/* par authentification HTTP Basic.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASSWORD;

  // Aucun mot de passe configuré :
  // - en dev local : on laisse passer pour ne pas gêner le développement ;
  // - en production : on bloque par sécurité (jamais d'admin ouvert en ligne).
  if (!pass) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse("Admin non configuré : définissez ADMIN_PASSWORD.", { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    const i = decoded.indexOf(":");
    const u = decoded.slice(0, i);
    const p = decoded.slice(i + 1);
    if (u === user && p === pass) return NextResponse.next();
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Zako Admin", charset="UTF-8"' },
  });
}
