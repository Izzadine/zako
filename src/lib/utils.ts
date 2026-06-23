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

// Valide + normalise un numéro tchadien au format international +235XXXXXXXX.
// Accepte : "60010450", "+235 60 01 04 50", "23560010450", "0023560010450".
// Mobiles tchadiens = 8 chiffres commençant par 6, 7 ou 9.
// Renvoie le numéro normalisé "+235XXXXXXXX", ou null si invalide.
export function normalizeChadPhone(input: string): string | null {
  let digits = (input || "").replace(/\D/g, "");
  if (digits.startsWith("00235")) digits = digits.slice(5);
  else if (digits.startsWith("235")) digits = digits.slice(3);
  if (!/^[679]\d{7}$/.test(digits)) return null;
  return "+235" + digits;
}

// Miniature optimisée Cloudinary (WebP + compression) si l'URL en provient.
export function thumb(url: string | null, width = 500): string | null {
  if (!url) return null;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
}
