export function formatPrice(fcfa: number): string {
  return new Intl.NumberFormat("fr-FR").format(fcfa) + " FCFA";
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString("fr-FR");
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Lien WhatsApp pré-rempli — cœur du produit.
export function whatsappLink(phone: string, title: string, id: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  const msg = encodeURIComponent(
    `Bonjour, je suis intéressé par votre annonce "${title}" sur Zako.\n${SITE}/annonce/${id}`
  );
  return `https://wa.me/${clean}?text=${msg}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

// Miniature optimisée Cloudinary (WebP + compression) si l'URL en provient.
export function thumb(url: string | null, width = 500): string | null {
  if (!url) return null;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
}
