import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["warn", "error"] : ["query", "warn", "error"],
});
