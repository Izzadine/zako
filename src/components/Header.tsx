import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-zako-dark text-white">
      <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
          <span>Zako</span>
          <span className="text-zako-red">.</span>
        </Link>
        <Link
          href="/recherche"
          className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white/70"
        >
          🔍 Rechercher une annonce…
        </Link>
        <Link href="/publier" className="hidden md:inline-block bg-zako-red px-4 py-2 rounded-full text-sm font-bold">
          + Publier
        </Link>
      </div>
    </header>
  );
}
