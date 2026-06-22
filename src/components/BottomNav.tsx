"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/recherche", label: "Rechercher", icon: "🔍" },
  { href: "/publier", label: "Publier", icon: "➕", primary: true },
  { href: "/mon-compte", label: "Compte", icon: "👤" },
];

export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 max-w-screen-sm mx-auto">
        {items.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          if (it.primary) {
            return (
              <Link key={it.href} href={it.href} className="flex flex-col items-center justify-center py-1.5">
                <span className="flex items-center justify-center w-11 h-11 -mt-5 rounded-full bg-zako-red text-white text-2xl shadow-lg">
                  {it.icon}
                </span>
                <span className="text-[10px] mt-0.5 text-gray-600">{it.label}</span>
              </Link>
            );
          }
          return (
            <Link key={it.href} href={it.href} className="flex flex-col items-center justify-center py-2.5">
              <span className="text-xl">{it.icon}</span>
              <span className={`text-[10px] mt-0.5 ${active ? "text-zako-red font-semibold" : "text-gray-500"}`}>
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
