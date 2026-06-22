# Zako — Marketplace d'annonces locales (Tchad)

Marketplace mobile-first façon Le Bon Coin pour N'Djaména. Publication d'annonces
en 3 clics, contact direct par **WhatsApp**, ultra légère pour les connexions instables.

**Stack** : Next.js 15 (App Router) · TypeScript · Prisma · PostgreSQL · Cloudinary · Tailwind.

## 🚀 Démarrage rapide (mode DÉMO, sans aucun service)

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000. L'app tourne avec des **données fictives** (aucune DB requise).
Tu peux naviguer, rechercher, ouvrir une annonce, tester le formulaire de publication
(les photos passent en data-URL) et le panel `/admin`.

## 🗄️ Passer en mode RÉEL (base de données + images)

1. Crée une base **PostgreSQL** gratuite ([Supabase](https://supabase.com) ou [Neon](https://neon.tech)).
2. Crée un compte [Cloudinary](https://cloudinary.com) (stockage images).
3. Remplis `.env.local` :
   ```
   DATABASE_URL="postgresql://..."
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```
4. Crée le schéma et les données de départ :
   ```bash
   npm run db:push     # crée les tables
   npm run db:seed     # catégories + admin + annonces démo
   npm run dev
   ```

## 📁 Structure

```
prisma/            schéma + seed
src/
  app/
    page.tsx               accueil (liste + catégories)
    annonce/[id]/          détail annonce + bouton WhatsApp
    publier/               formulaire 3 étapes + page merci
    recherche/             recherche & filtres
    mon-compte/            (OTP à brancher)
    admin/                 modération (valider / mettre en avant / rejeter)
    api/                   listings, categories, upload, admin
  components/        UI (cards, nav, uploader, filtres…)
  lib/               prisma, cloudinary, data (avec fallback démo), utils
  types/
```

## 🔌 API (REST)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/listings` | liste + filtres `?category=&q=&minPrice=&maxPrice=&page=` |
| POST | `/api/listings` | créer une annonce (statut `PENDING`) |
| GET | `/api/listings/:id` | détail |
| DELETE | `/api/listings/:id` | suppression douce |
| GET | `/api/categories` | catégories |
| POST | `/api/upload` | upload image → Cloudinary |
| PATCH | `/api/admin/listings/:id` | valider / rejeter / mettre en avant |
| PATCH | `/api/admin/users/:id/block` | bloquer un utilisateur |

## 🔒 Accès admin

`/admin` et `/api/admin/*` sont protégés par authentification HTTP Basic
([src/middleware.ts](src/middleware.ts)). Identifiants via les variables `ADMIN_USER`
(défaut `admin`) et `ADMIN_PASSWORD`. En production, **`ADMIN_PASSWORD` est obligatoire** :
sans lui, l'admin renvoie 503 (jamais ouvert en ligne).

## ⚠️ À faire avant la production

- **Authentification OTP** (téléphone) — voir `src/app/mon-compte`. Brancher Supabase Auth
  ou un provider SMS, puis protéger `POST /api/listings`.
- ✅ ~~Protéger `/admin`~~ — fait (Basic Auth).
- Rate-limiting sur l'upload et la création d'annonces (anti-spam).

## ☁️ Déploiement (Vercel)

1. Pousser le code sur GitHub.
2. Importer le repo sur [Vercel](https://vercel.com).
3. Ajouter les variables d'environnement :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | URL Neon/Supabase |
   | `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | depuis Cloudinary |
   | `NEXT_PUBLIC_SITE_URL` | l'URL publique (ex. `https://zako.vercel.app`) |
   | `ADMIN_USER` / `ADMIN_PASSWORD` | identifiants admin (mot de passe **fort**) |

4. **Deploy**. La DB et Cloudinary restent sur leurs services managés.
