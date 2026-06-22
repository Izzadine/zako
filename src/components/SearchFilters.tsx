"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/types";

export function SearchFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <form onSubmit={apply} className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔍 Que recherchez-vous ?"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base bg-white"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          inputMode="numeric"
          placeholder="Prix min"
          className="w-1/2 rounded-xl border border-gray-200 px-4 py-3 text-base"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          inputMode="numeric"
          placeholder="Prix max"
          className="w-1/2 rounded-xl border border-gray-200 px-4 py-3 text-base"
        />
      </div>
      <button type="submit" className="w-full bg-zako-red text-white font-bold py-3 rounded-xl active:scale-[0.98]">
        Rechercher
      </button>
    </form>
  );
}
