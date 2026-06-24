// Réglages produit pilotés par variables d'environnement.

// Publication ouverte au public ?
// false (défaut) => seul l'admin publie (phase de lancement "concierge").
// true            => les visiteurs peuvent publier eux-mêmes via /publier.
export const PUBLISHING_OPEN = process.env.NEXT_PUBLIC_PUBLISHING_OPEN === "true";

// Numéro WhatsApp de l'équipe Zako (pour "Envoyez-nous votre annonce").
export const ZAKO_WHATSAPP = process.env.NEXT_PUBLIC_ZAKO_WHATSAPP || "+235600000000";
