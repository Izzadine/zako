import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "voiture", name: "Voitures", icon: "🚗", order: 1 },
  { slug: "immobilier", name: "Immobilier", icon: "🏠", order: 2 },
  { slug: "terrain", name: "Terrains", icon: "🌍", order: 3 },
  { slug: "moto", name: "Motos", icon: "🏍️", order: 4 },
  { slug: "electronique", name: "Électronique", icon: "📱", order: 5 },
  { slug: "autre", name: "Autres", icon: "📦", order: 6 },
];

async function main() {
  console.log("🌱 Seed des catégories...");
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  console.log("🌱 Création de l'admin...");
  const admin = await prisma.user.upsert({
    where: { phone: "+235600000000" },
    update: {},
    create: { phone: "+235600000000", name: "Admin Zako", role: "ADMIN", whatsapp: "+235600000000" },
  });

  const voiture = await prisma.category.findUnique({ where: { slug: "voiture" } });
  const immo = await prisma.category.findUnique({ where: { slug: "immobilier" } });

  console.log("🌱 Annonces de démonstration...");
  const demo = [
    {
      title: "Toyota Corolla 2015 - propre",
      description: "Très bon état, climatisation, papiers à jour. Visible à Moursal.",
      price: 4500000,
      district: "Moursal",
      whatsapp: "+235600000001",
      categoryId: voiture!.id,
      photo: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
    },
    {
      title: "Villa 4 chambres à louer - Chagoua",
      description: "Grande villa avec cour, forage, électrique. Idéale famille.",
      price: 350000,
      district: "Chagoua",
      whatsapp: "+235600000002",
      categoryId: immo!.id,
      photo: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    },
  ];

  for (const d of demo) {
    await prisma.listing.create({
      data: {
        title: d.title,
        description: d.description,
        price: d.price,
        district: d.district,
        whatsapp: d.whatsapp,
        categoryId: d.categoryId,
        userId: admin.id,
        status: "ACTIVE",
        photos: { create: [{ url: d.photo, publicId: "demo", order: 0 }] },
      },
    });
  }

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
