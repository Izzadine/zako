import Link from "next/link";
import type { Category } from "@/types";

export function CategoryNav({ categories, active }: { categories: Category[]; active?: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
      <Link
        href="/"
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${
          !active ? "bg-zako-dark text-white border-zako-dark" : "bg-white text-gray-700 border-gray-200"
        }`}
      >
        Tout
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/recherche?category=${c.slug}`}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${
            active === c.slug ? "bg-zako-dark text-white border-zako-dark" : "bg-white text-gray-700 border-gray-200"
          }`}
        >
          {c.icon} {c.name}
        </Link>
      ))}
    </div>
  );
}
