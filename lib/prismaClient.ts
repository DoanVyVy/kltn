import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
let prismaInstance: PrismaClient | null = null;

/**
 * Get a singleton instance of PrismaClient
 * This ensures we don't create multiple instances during hot reloads in development
 */
function getPrismaInstance() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
  return prismaInstance;
}

// Create and export the prisma client
const prisma = getPrismaInstance();

export default prisma;
