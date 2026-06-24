"use client";

import { useCallback, useEffect, useState } from "react";

export type Me = {
  id: string;
  phone: string;
  name: string | null;
  whatsapp: string | null;
  role?: string;
} | null;

export function useMe() {
  const [user, setUser] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const json = await res.json();
      setUser(json.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh, logout };
}
