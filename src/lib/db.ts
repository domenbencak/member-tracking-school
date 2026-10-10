import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getSchoolDatabaseUrl } from "@/lib/school-database";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = getSchoolDatabaseUrl(process.env.DATABASE_URL);
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, max: 5, idleTimeoutMillis: 10_000 }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
