import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Get database path from environment or use default
const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

// Create Prisma adapter for better-sqlite3
// Prisma 7 requires a url option, not a Database instance
const adapter = new PrismaBetterSqlite3({
  url: dbUrl.replace("file:", ""),
});

// Singleton pattern for serverless environments
// Prevents multiple PrismaClient instances during hot reloads in development
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
