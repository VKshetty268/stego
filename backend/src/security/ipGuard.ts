import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function enforceSignupIpQuota(ip: string, maxPerHour = 3) {
  const oneHourAgo = new Date(Date.now() - 60*60*1000);
  const count = await prisma.signupAttempt.count({
    where: { ip, createdAt: { gte: oneHourAgo } }
  });
  if (count >= maxPerHour) return false;
  await prisma.signupAttempt.create({ data: { ip }});
  return true;
}
