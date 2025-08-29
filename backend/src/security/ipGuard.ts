// src/security/ipGuard.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * enforceSignupIpQuota - prevents too many signups from same IP in window.
 * Returns false if quota exceeded, otherwise records the attempt and returns true.
 */
export async function enforceSignupIpQuota(ip: string, maxPerHour = 3) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.signupAttempt.count({
    where: { ip, createdAt: { gte: oneHourAgo } }
  });
  if (count >= maxPerHour) return false;
  await prisma.signupAttempt.create({ data: { ip } });
  return true;
}
