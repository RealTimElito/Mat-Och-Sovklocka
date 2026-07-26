import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// In dev, avoid creating a new client on every reload.
// eslint-disable-next-line no-undef
const globalForPrisma = globalThis;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL for Prisma Postgres adapter");
}

export const prisma =
  globalForPrisma.__mosk_prisma__ ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
    log: ["error", "warn"],
  });

// eslint-disable-next-line no-underscore-dangle
globalForPrisma.__mosk_prisma__ = prisma;

