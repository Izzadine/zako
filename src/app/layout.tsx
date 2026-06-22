import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Zako — Petites annonces au Tchad",
  description: "Achetez et vendez facilement à N'Djaména : voitures, immobilier, motos, électronique. Contact direct par WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1D3557",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main className="max-w-screen-sm mx-auto px-4 pb-24 pt-4 min-h-screen">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
