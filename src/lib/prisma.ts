import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// True si une vraie base est configurée. Sinon l'app tourne en mode DEMO.
export const HAS_DB = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
